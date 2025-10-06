import { PrismaClient } from "../../src/generated/prisma/index.js"

const globalForPrisma= global as unknown as {prisma:PrismaClient}

export const prisma=globalForPrisma.prisma|| new PrismaClient({
    log:process.env.NODE_ENV==="development"?["query","error","warn"]:["error"]
})
if (process.env.NODE_ENV!=="production") globalForPrisma.prisma=prisma

export const testConnection=async()=>{
    try{
        await prisma.$connect();
        console.log("DB Connected successfully (prisma)");
        return true;
    }catch(err){
        console.log(err);
        return false;
    }
}

export default prisma;