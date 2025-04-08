import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import { compare } from "bcryptjs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "账号密码",
      credentials: {
        email: { label: "邮箱", type: "email", placeholder: "输入邮箱地址" },
        password: { label: "密码", type: "password", placeholder: "输入密码" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码");
        }

        try {
          // 连接到MongoDB
          const client = await clientPromise;
          const db = client.db("blogs");
          
          // 查找用户
          const user = await db.collection("users").findOne({ 
            email: credentials.email 
          });

          if (!user || !user.password) {
            throw new Error("用户不存在或未设置密码");
          }

          // 验证密码
          const isPasswordValid = await compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            throw new Error("密码错误");
          }

          // 返回用户信息(不包括密码)
          return {
            id: user._id.toString(),
            name: user.name || user.email.split("@")[0],
            email: user.email,
            image: user.image,
            role: user.role || "user"
          };
        } catch (error) {
          console.error("认证失败:", error);
          throw new Error(error.message || "认证失败");
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 允许所有谷歌登录尝试，权限检查会在后续进行
      return true;
    },
    async jwt({ token, account, profile, user }) {
      // 初次登录时添加账号信息
      if (account) {
        token.provider = account.provider;
      }
      
      // 如果是通过凭据登录，添加角色信息
      if (user && user.role) {
        token.role = user.role;
      }
      
      return token;
    },
    async session({ session, token }) {
      // 向会话添加额外信息
      if (token) {
        session.user.id = token.sub;
        session.user.provider = token.provider;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',  // 自定义登录页面
    error: '/login',   // 错误页面
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24小时
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };