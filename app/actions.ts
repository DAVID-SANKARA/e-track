'use server'
import prisma from "@/lib/prisma";


export async function checkAndAddUser(email: string | undefined) {
    if (!email) return 

    try {
        const existingUser =  await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (!existingUser) {
            await prisma.user.create({
                data:{email}
            })
            console.log("nouvelle Utilisateur ajouté dans la base de données");
        }else{
            console.log("Utilisateur déja present dans la base de données");
            
        }
        
    } catch (error) {
        console.error("erreur lors de la vérificaation de l'utilisateur :", error);
    }
}

export async function addBudget(email: string, name: string, amount: number,
    selectedEmoji: string){
        try {
            const user = await prisma.user.findUnique({
                where: {email}
            })

            if (!user) {
                throw new Error('Utilisateur non trouvé')
            }
            await prisma.budget.create({
                data: {
                    name,
                    amount,
                    emoji: selectedEmoji,
                    userId: user.id
                }
            })
            
        } catch (error) {
            console.error("erreur los de l'ajout du budget:", error);
            
        }
}

export async function getBudgetsByUser(email: string){
    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            },
            include : {
                budgets: {
                    include : {
                        transactions:true
                    }
                }
            }
        })
        if(!user) {
            throw new Error("Utilisateur non trouvé")
        }
        return user.budgets

    } catch (error) {
        console.error('Erreur lors de la récuperation des budgets:', error);
        throw Error;
        
    }
}