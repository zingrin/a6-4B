import { UserRoles } from "../../generated/prisma/enums";
import "dotenv/config"
import { prisma } from "../lib/prisma";

async function seedAdmin() {
    try {

        if (process.env.ALLOW_ADMIN_SEED !== "true") {
            console.log("Please set ALLOW_ADMIN_SEED environment variable to true");
            return
        }

        console.log("********* Seed Admin Started *********")

        const adminData = {
            name : "Admin",
            email : "admin@skillbridge.com",
            role : UserRoles.ADMIN,
            password : "sklb3210",
            // emailVerified : true
        }
        
        console.log("********* Checking existing admin email *********")
        
        const existingUser = await prisma.user.findUnique({
            where : {
                email : adminData.email
            }
        })

        if (existingUser) {
            throw new Error("User already exists")
        }



        const signupAdmin = await fetch(`${process.env.BETTER_AUTH_URL}/api/auth/sign-up/email`, {
            method : "POST",
            headers : {
                "Content-Type" : "application/json",
                "Origin": process.env.APP_URL || "http://localhost:3000"
            },
            body : JSON.stringify(adminData)
        })

        const result = await signupAdmin.json()
        console.log(result)

        if (signupAdmin.ok) {

        console.log("********* Admin created *********")

            await prisma.user.update({
                where : {
                    email : adminData.email
                },
                data : {
                    emailVerified : true
                }
            })

        console.log("********* Email verification status updated *********")

        }

        console.log("********* SUCCESS *********")


    } catch (error) {
        console.error(error);
    }
}

seedAdmin()