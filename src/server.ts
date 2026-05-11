import "dotenv/config"
import app from "./app"
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT;

async function main() {
    try {
        await prisma.$connect();
        console.log("DB connected successfully.")

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`)
        });

    } catch (error) {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();