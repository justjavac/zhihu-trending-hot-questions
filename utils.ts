import type { Question } from "./types.ts";

/** 合并两次热门话题并根据 id 去重 */
export function mergeQuestions(
  words: Question[],
  another: Question[],
): Question[] {
  const obj: Record<string, string> = {};
  for (const w of words.concat(another)) {
    obj[w.url] = w.title;
  }
  return Object.entries(obj).map(([url, title]) => ({
    url,
    title,
  }));
}

export async function createReadme(words: Question[]): Promise<string> {
  const readme = await Deno.readTextFile("./README.md");
  return readme.replace(/<!-- BEGIN -->[\W\w]*<!-- END -->/, createList(words));
}

export function createList(words: Question[]): string {
  return `<!-- BEGIN -->
<!-- 最后更新时间 ${Date()} -->
${
    words.map((x) => `1. [${x.title}](${x.url})`)
      .join("\n")
  }
<!-- END -->`;
}

export function createArchive(words: Question[], date: string): string {
  return `# ${date}\n
共 ${words.length} 条\n
${createList(words)}
`;
}
