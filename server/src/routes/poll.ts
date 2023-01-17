import { FastifyInstance } from "fastify"
import { z, ZodBigInt } from "zod"
import { prisma } from "../lib/prisma"
import ShortUniqueId from 'short-unique-id'
import { authenticate } from "../plugins/authenticate"

export async function pollRoutes(fastify: FastifyInstance) {
    fastify.get('/polls/count', async () => {
        const count = await prisma.poll.count()

        return { count }
    })

    fastify.post('/polls', async (request, response) => {
        const createPollBody = z.object({
            title: z.string(),
        })

        const { title } = createPollBody.parse(request.body)

        const generate = new ShortUniqueId({ length: 6 })
        const code = String(generate()).toUpperCase()

        let ownerId = null

        try {
            await request.jwtVerify()

            await prisma.poll.create({
                data: {
                    title,
                    code,
                    ownerId: request.user.sub,

                    participants: {
                        create: {
                            userId: request.user.sub,
                        }
                    }
                }
            })
        } catch {
            await prisma.poll.create({
                data: {
                    title,
                    code
                }
            })
        }

        

        return response.status(201).send({ code })
    })

    fastify.post('/polls/join', {
        onRequest: [authenticate]
    }, async (request, response) => {
        const joinPollBody = z.object({
            code: z.string(),
        })

        const { code } = joinPollBody.parse(request.body)

        const poll = await prisma.poll.findUnique({
            where: {
                code,
            },
            include: {
                participants: {
                    where: {
                        userId: request.user.sub,
                    }
                }
            }
        })
        
        if(!poll) {
            return response.status(400).send({
                message: "Poll not found."
            })
        }

        if(poll.participants.length > 0) {
            return response.status(400).send({
                message: "You already joined this poll."
            })
        }

        if(!poll.ownerId) {
            await prisma.poll.update({
                where: {
                    id: poll.id,
                },
                data: {
                    ownerId: request.user.sub,
                }
            })
        }

        await prisma.participant.create({
            data: {
                pollId: poll.id,
                userId: request.user.sub,
            }
        })

        return response.status(201).send()
    })

    fastify.get('/polls', {
        onRequest: [authenticate]
    }, async (request) => {
        const polls = await prisma.poll.findMany({
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                participants: {
                    select: {
                        id: true,                        
                        user: {
                            select: {
                                avatarUrl: true,
                            }
                        }
                    },
                    take: 4,
                },
                _count: {
                    select: {
                        participants: true
                    }
                }
            },
            where: {
                participants: {
                    some: {
                        userId: request.user.sub,
                    }
                }
            },
        })
        return { polls } 
    })

    fastify.get('/polls/:pollId', {
        onRequest: [authenticate]
    }, async (request, response) => {
        const getPollParams = z.object({
            pollId: z.string(),
        })

        const { pollId } = getPollParams.parse(request.params) 

        const poll = await prisma.poll.findFirst({
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                participants: {
                    select: {
                        id: true,
                        
                        user: {
                            select: {
                                avatarUrl: true,
                            }
                        }
                    },
                    take: 4,
                },
                _count: {
                    select: {
                        participants: true
                    }
                }
            },
            where: {
                id: pollId,
                participants: {
                    some: {
                        userId: request.user.sub,
                    }
                }
            }
        })

        if(!poll) {
            return response.status(400).send({
                message: 'Poll not found.'
            })
        }

        return { poll }
    })
}