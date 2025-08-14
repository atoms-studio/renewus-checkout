import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from "next"

type Repo = {
  name: string
  stargazers_count: number
}

type SettingsPath = {
  params: {
    partnerId: string
  }
}

const handlePathsFetchingError = (error: any) => {
  console.error("Unable to fetch partner paths: ", error)
  console.info("Returning default path for partner settings")
  return {
    paths: [
      {
        params: {
          partnerId: "whitelabel-test",
        },
      },
    ],
    fallback: true, // or false depending on your needs
  }
}

export const getStaticPaths = (async () => {
  const token = process.env.SB_TOKEN
  let paths: SettingsPath[] = []

  if (!token) {
    return handlePathsFetchingError(new Error("Missing token env"))
  }
  const isProduction = process.env.NODE_ENV === "production"
  const response = await fetch(
    `https://api-us.storyblok.com/v2/cdn/stories?token=${token}&content_type=Homepage&version=${isProduction ? "published" : "draft"}`,
  )

  if (!response.ok) {
    return handlePathsFetchingError(
      `\n${JSON.stringify(response.statusText, null, 2)}`,
    )
  }

  try {
    const responseData = await response.json()
    const stories = responseData.stories
    if (!stories || !Array.isArray(stories)) {
      throw new Error(
        "Invalid response structure: stories not found or not an array",
      )
    }
    paths = stories.map((story: { slug: string }) => ({
      params: {
        partnerId: story.slug,
      },
    })) as SettingsPath[]
  } catch (error) {
    return handlePathsFetchingError(
      `'Invalid response structure\n'${JSON.stringify(error, null, 2)}`,
    )
  }

  if (paths.length === 0) {
    return handlePathsFetchingError(new Error("No paths found"))
  }

  return {
    paths,
    fallback: 'blocking',
  }
}) satisfies GetStaticPaths

export const getStaticProps = (async (context) => {
    const { params } = context
  const res = await fetch("https://api.github.com/repos/vercel/next.js")
  const repo = await res.json()
  return { props: { repo } }
}) satisfies GetStaticProps<{
  repo: Repo
}>

export default function Page({
  repo,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return repo.stargazers_count
}
