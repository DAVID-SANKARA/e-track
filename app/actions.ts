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

export async function getTransactionsByBudgetId(budgetId: string) {
    try {
        const budget = await prisma.budget.findUnique({
            where: {
               id: budgetId
            },
            include:  {
                transactions: true
            }
        })
        if (!budget) {
            throw new Error("budget non trouvé");
        }
        return budget;
    } catch (error) {
        console.error('Erreur lors de la récupération des transactions:', error);
        throw error;
        
    }
}

export async function addTransactionsToBudget(
    budgetId: string,
    amount: number,
    description: string

){
    try {

        const budget = await prisma.budget.findUnique({
            where: {
                id: budgetId
            },
            include: {
                transactions: true
            }
        })
        if (!budget) {
            throw new Error('Budget non trouvé');
        }

        const totalTransactions = budget.transactions.reduce((sum, transaction) => 
            {
            return sum + transaction.amount
        }, 0)
        const totalWithNewTransaction = totalTransactions + amount

        if (totalWithNewTransaction > budget.amount) {
            throw new Error("Le montant total des transactions dépasse le montant du budget.");
        }

        const newTransaction = await prisma.transaction.create({
            data:{
                amount,
                description,
                emoji: budget.emoji,
                budget:{
                    connect: {
                        id: budget.id
                    }
                }
            }
        })
        
    } catch (error) {
        console.error("Erreur lors de l'ajout de la transaction:", error);
        throw Error;
        
        
    }

}
export const deleteBudget = async (budgetId: string) => {
    try {
        await prisma.transaction.deleteMany({
            where: {budgetId}
        })
        await prisma.budget.delete({
            where: {
                id: budgetId
            }
        })
        
    } catch (error) {
        console.error("Erreur lors de la suppression du budget et de ses transactions associées:", error);
        throw error;
    }
}
export async function deleteTransaction(transactionId: string){
    try {
        const transaction = await prisma.transaction.findUnique({
            where:{
                id: transactionId
            }
        })
        if (!transaction) {
            throw new Error('Transaction non trouvée.')
        }
        await prisma.transaction.delete({
            where: {
                id: transactionId,
            }
        })

    } catch (error) {
        console.error("erreur lors de la supression de la transaction:", error);
        
    }
}
