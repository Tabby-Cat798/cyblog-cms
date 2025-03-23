import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 允许所有谷歌登录尝试，权限检查会在后续进行
      return true;
    },
    async jwt({ token, account, profile }) {
      // 初次登录时添加账号信息
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      // 向会话添加额外信息
      if (token) {
        session.user.id = token.sub;
        session.user.provider = token.provider;
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