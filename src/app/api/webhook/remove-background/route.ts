import { Response, webhookSchema } from "@/server/constants"
import { prisma } from "@/server/db"
import { replicate } from "@/server/replicate"
import { put } from "@vercel/blob"

export async function POST(req: Request) {
  try {
    const searchParams = new URL(req.url).searchParams
    const parsedParams = webhookSchema.safeParse(Object.fromEntries(searchParams))
    if (!parsedParams.success) return Response.invalidRequest(parsedParams.error)
    const { id } = parsedParams.data

    // get output from Replicate
    const body = await req.json()
    console.log(body)
    const { output } = body
    if (!output) return Response.badRequest("Missing output")

    // convert output to a blob object
    const file = await fetch(output[0]).then((res) => res.blob())

    // upload & store image
    const { url } = await put(`${id}-original.png`, file, { access: "public" })

    // update emoji
    await prisma.emoji.update({ where: { id }, data: { originalUrl: url } })

    const res = await replicate.removeBackground({ id, image: output[0] })
    console.log(res)

    return Response.ok()
  } catch (error) {
    console.error(error)
    return Response.internalServerError()
  }
}
