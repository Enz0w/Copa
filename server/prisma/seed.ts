import { PrismaClient } from "@prisma/client"
import { userRoutes } from "../src/routes/user"

const prisma = new PrismaClient()

async function main(){
    // const user = await prisma.user.create({
    //     data:  {
    //         name: 'John Doe',
    //         email: 'john.doe@gmail.com',
    //         avatarUrl: 'https://github.com/diego3g.png',
    //         googleId: 'cla4e1a3g0041asd45cas9xk'
    //     }
    // })

    // const poll = await prisma.poll.create({
    //     data: {
    //         title: 'Apostinha di cria',
    //         code: 'BOL123',
    //         ownerId: user.id,
            
    //         participants: {
    //             create: {
    //                 userId: user.id
    //             }
    //         }
    //     }
    // })

    await prisma.game.create({
        data: {
            date: '2022-11-22T12:00:00.201Z',
            firstTeamCountryCode: 'JP',
            secondTeamCountryCode: 'NL',
        }
        
    })
    

    // await prisma.game.create({
    //     data: {
    //         date: '2022-11-04T12:00:00.201Z',
    //         firstTeamCountryCode: 'BR',
    //         secondTeamCountryCode: 'AR',

    //         guesses: {
    //            create: {
    //             firstTeamPoints: 2,
    //             secondTeamPoints: 1,

    //             participant: {
    //                 connect: {
    //                     userId_pollId: {
    //                         userId: user.id,
    //                         pollId: poll.id,
    //                     }
    //                 }
    //             }
    //            }
    //         }
    //     },
    // })
}

main()