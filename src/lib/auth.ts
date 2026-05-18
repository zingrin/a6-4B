import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { createAuthMiddleware } from "better-auth/api";
import { UserRoles } from "../../generated/prisma/enums";
import sendVerificationEmail from "../utils/sendVerificationEmail";
import "dotenv/config"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }), 
    // trustedOrigins : [process.env.APP_URL!],
  trustedOrigins: async (request) => {
    const origin = request?.headers.get("origin");

    const allowedOrigins = [
      process.env.APP_URL,
      process.env.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:4000",
      "http://localhost:5000",
      "https://skillbridge-frontend-murex.vercel.app",
      "https://skillbridge-frontend-murex.vercel.app",
    ].filter(Boolean);

    // Check if origin matches allowed origins or Vercel pattern
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin)
    ) {
      return [origin];
    }

    return [];
  },
  basePath: "/api/auth",
    
    
    user : {
        additionalFields : {
           role : {
            type : "string",
            required : true
           },
           status : {
            type : "string",
            defaultValue : "ACTIVE",
            required : false
           },
        }
    },

    emailAndPassword: { 
        enabled: true,
        autoSignIn : false,
    },

    emailVerification : {
        sendVerificationEmail : async ({ user, url, token }) => {
            console.log(url) 
            sendVerificationEmail({ user: { ...user, image: user.image ?? null } , url, token })
        },
        autoSignInAfterVerification : true
    },
    
    socialProviders: {
        google: { 
            prompt : "select_account consent",
            accessType : "offline",
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }, 
    },
    hooks : {
        before : createAuthMiddleware(async (ctx) => {
            if (ctx.path === "/sign-up/email") {
                if (ctx.body.role === UserRoles.ADMIN && (process.env.ALLOW_ADMIN_SEED !== "true")) {
                    throw new APIError("BAD_REQUEST", {
                        message : "You can't sign up as admin"
                    });
                }
                if (ctx.body.role === UserRoles.MODERATOR || ctx.body.role === UserRoles.MENTOR) {
                    const inviteToken = ctx.headers?.get("x-invite-token");
                    if (!inviteToken) {
                        throw new APIError("BAD_REQUEST", { message : "You cannot register as a moderator or mentor without an invite code" });
                    }
                    const verification = await prisma.verification.findFirst({
                        where: { 
                            identifier: { endsWith: `:${ctx.body.email}` },
                            value: inviteToken 
                        }
                    });
                    if (!verification || verification.expiresAt < new Date()) {
                        throw new APIError("BAD_REQUEST", { message : "Invalid or expired invite" });
                    }
                }
            }
        }),
    },
    databaseHooks : {
        user : {
            create : {
                after : async (user) => {
                    try {
                        if (user.role === UserRoles.TUTOR) {
                            await prisma.tutorProfiles.create({
                                data : {
                                    userId : user.id
                                }
                            })
                        } else if (user.role === UserRoles.INSTITUTE) {
                            await prisma.instituteProfile.create({
                                data: {
                                    userId: user.id,
                                    name: user.name,
                                }
                            })
                        }
                        
                        if (user.role === UserRoles.MODERATOR || user.role === UserRoles.MENTOR) {
                            
                            if (user.role === UserRoles.MENTOR) {
                                const verification = await prisma.verification.findFirst({
                                    where: { identifier: { startsWith: 'invite:mentor:', endsWith: `:${user.email}` } }
                                });
                                if (verification) {
                                    const instituteId = verification.identifier.split(':')[2] as string;
                                    await prisma.mentorProfile.create({
                                        data: {
                                            userId: user.id,
                                            instituteId: instituteId
                                        }
                                    });
                                }
                            }

                            await prisma.verification.deleteMany({
                                where: { identifier: { endsWith: `:${user.email}` } }
                            });
                            await prisma.user.update({
                                where: { id: user.id },
                                data: { emailVerified: true }
                            });
                        }
                    } catch (error) {
                        console.log(error)
                    }
                    
                }
            }
        }
    }
});