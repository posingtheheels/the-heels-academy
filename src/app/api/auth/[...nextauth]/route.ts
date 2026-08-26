import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizarEmail } from "@/lib/email-normalize";

// Hash válido de bcrypt que no corresponde a ninguna contraseña real. Sirve para
// gastar el mismo tiempo de CPU cuando el email no existe (ver authorize).
const HASH_DESCARTE =
  "$2a$12$.G46ElMJ6HKRzEHwIskLZeDVPIjdlRxMoqpCWTIQsbur64ExgQbsi";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son obligatorios");
        }

        const email = normalizarEmail(credentials.email);

        const user = await prisma.user.findUnique({
          where: { email },
        });

        // Se compara siempre, incluso sin usuario, contra un hash de descarte. Así
        // el tiempo de respuesta no delata si el email existe.
        const hashAComparar = user?.password ?? HASH_DESCARTE;
        const passwordCorrecta = await bcrypt.compare(
          credentials.password,
          hashAComparar
        );

        // Mismo mensaje si el email no existe o si la contraseña falla: distinguirlos
        // permitía averiguar desde fuera qué correos tienen cuenta en la academia.
        if (!user || !passwordCorrecta) {
          throw new Error("Email o contraseña incorrectos");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as "USER" | "ADMIN",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
    updateAge: 24 * 60 * 60,   // Refrescar cada 24 horas si se usa la app
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
