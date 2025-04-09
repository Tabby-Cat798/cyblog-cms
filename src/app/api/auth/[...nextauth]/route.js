import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import { compare } from "bcryptjs";
import { ObjectId } from "mongodb";

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
          
          // 验证用户权限
          if (user.role !== "admin" && user.permission !== "admin") {
            throw new Error("您没有权限访问此系统，仅限管理员使用");
          }

          // 返回用户信息(不包括密码)
          return {
            id: user._id.toString(),
            name: user.name || user.username || user.email.split("@")[0],
            email: user.email,
            image: user.avatar || null,
            role: user.role || user.permission || "user"
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
      // 仅允许已有的管理员Google账号登录
      if (account.provider === "google") {
        try {
          // 连接到MongoDB
          const client = await clientPromise;
          const db = client.db("blogs");
          
          // 查找用户是否已存在
          const existingUser = await db.collection("users").findOne({ 
            email: profile.email 
          });
          
          // 检查用户是否存在且为管理员
          if (existingUser && (existingUser.role === "admin" || existingUser.permission === "admin")) {
            // 允许登录，更新信息
            const updateFields = { 
              lastLogin: new Date() 
            };
            
            // 仅在用户没有avatar字段时使用Google头像
            if (!existingUser.avatar) {
              updateFields.avatar = profile.picture;
            }
            
            await db.collection("users").updateOne(
              { email: profile.email },
              { $set: updateFields }
            );
            
            // 为NextAuth会话设置用户ID
            user.id = existingUser._id.toString();
            
            // 从数据库设置用户名和头像
            user.name = existingUser.name || profile.name;
            user.image = existingUser.avatar || profile.picture;
            user.role = existingUser.role || existingUser.permission;
            
            console.log("Google登录成功：管理员用户", user.id, "名称:", user.name);
            return true;
          } else {
            // 用户不存在或不是管理员，拒绝登录
            let errorMessage = existingUser 
              ? "您没有权限访问此系统，仅限管理员使用" 
              : "用户不存在，请联系管理员创建账号";
            
            console.log("Google登录拒绝：", existingUser ? "用户不是管理员" : "用户不存在", profile.email);
            
            // 返回带有错误消息的URL
            return `/login?error=${encodeURIComponent(errorMessage)}`;
          }
        } catch (error) {
          console.error("Google登录处理失败:", error);
          return `/login?error=${encodeURIComponent("登录处理出错，请稍后再试")}`;
        }
      }
      
      // 凭证登录时在authorize函数中已验证
      return true;
    },
    async jwt({ token, account, profile, user }) {
      // 初次登录时添加账号信息
      if (account) {
        token.provider = account.provider;
      }
      
      // 如果是通过凭据或第三方登录，添加用户信息
      if (user) {
        // 确保用户ID被正确添加到token
        if (user.id) {
          token.sub = user.id;
          console.log("JWT回调：设置token.sub为用户ID:", user.id);
        }
        
        // 添加用户名称和头像到token
        if (user.name) {
          token.name = user.name;
        }
        
        if (user.image) {
          token.picture = user.image;
        }
        
        if (user.role) {
          token.role = user.role;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // 向会话添加额外信息
      if (token) {
        session.user.id = token.sub;
        session.user.provider = token.provider;
        session.user.role = token.role;
        
        // 如果token中有name，使用token的值
        if (token.name) session.user.name = token.name;
        
        // 如果有用户ID，尝试从数据库获取最新的用户信息
        if (token.sub) {
          try {
            const client = await clientPromise;
            const db = client.db("blogs");
            
            const user = await db.collection("users").findOne({
              _id: new ObjectId(token.sub)
            });
            
            if (user) {
              // 优先使用数据库中的信息更新会话
              session.user.name = user.name || session.user.name;
              session.user.image = user.avatar || token.picture; // 使用avatar作为头像
              session.user.role = user.role || user.permission || session.user.role;
              console.log("会话回调：从数据库更新用户信息，用户名:", session.user.name);
            }
          } catch (error) {
            console.error("从数据库更新会话信息失败:", error);
          }
        }
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