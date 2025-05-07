// Copyright 2025 justjavac(迷渡). All rights reserved. MIT license.
import { format } from "@std/datetime";
import { join } from "@std/path";
import { exists } from "@std/fs";

import type { HotList, Question } from "./types.ts";
import { createArchive, createReadme, mergeQuestions } from "./utils.ts";

const response = await fetch(
  "https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=100",
  {
    "headers": {
      "cookie":
        "_zap=6de89a99-3b6b-4d20-8dfa-a37ac1a275e4; d_c0=AfBR-ln-ohmPTlWYbo8fsGpGFz0JxV6XYT4=|1733215042; HMACCOUNT=D6C6DDA6A8FEF6B6; __snaker__id=167qicjwRlwmvZrm; q_c1=cade023a34dd49d3813d9f4df8a8fae0|1738903749000|1738903749000; edu_user_uuid=edu-v1|a96d9972-6e99-4f3f-9d9f-d6c87092a8f3; _xsrf=jDEfk6nNPnMBkUGbMc76zR3zoBB5ONf2; Hm_lvt_98beee57fd2ef70ccdd5ca52b9740c49=1743984445; Hm_lpvt_98beee57fd2ef70ccdd5ca52b9740c49=1743984445; z_c0=2|1:0|10:1744699435|4:z_c0|80:MS4xa2pzTUFBQUFBQUFtQUFBQVlBSlZUY2dSNDJqb3lBalB1a3l4bi1iS1hpbXhaQmFIRHRfRExnPT0=|5888bb74e117a3b4dc4968ba5e3d3ceb3c14d5b5a17d36a058f3e0eb83f982b7; q_c1=cade023a34dd49d3813d9f4df8a8fae0|1744943051000|1738903749000; __zse_ck=004_o4NzQAcuo1wIiEJIXbG4PK/Rfn198zC6eNXeyRXNlwIu4aGX3eMCLlQhH7fe64YEPL0bhBpcOpGcYHZ2C4m6N/482OvxQsZSL7deGNEKt3DIufXyz14mWwUuk4ULD3/P-rltGpa12CoBbs+2FLZl9lNk+EhNqtWiWN9SmG7Qn5VxFIP3/gJmfc67ipceessfIXsurJjL72pqxx6rIgzwS5bVdxhFbNfcJ2iXWpx4a8seXED6H7qnqZPSKrSpMsqRl; SESSIONID=GTH4iEWLcjAv09F0Kl4qplz7AqgAwTlVh0q4h62G3K1; JOID=UVAXBE6uexXex7jtT6iGRfybQkJX4iVY6Kj2sAbLGl6t9YegdYGvC7LKueJIF-L22sTTQ2KOmPKLNFzhXOibP5w=; osd=VlwdAUupdx_bwr_hRa2DQvCRR0dQ7i9d7a_6ugPOHVKn8IKneYuqDrXGs-dNEO7838HUT2iLnfWHPlnkW-SROpk=; tst=r; BEC=b7b0f394f3fd074c6bdd2ebbdd598b4e",
    },
  },
);

if (!response.ok) {
  console.error(response.statusText);
  Deno.exit(-1);
}

const result: HotList = await response.json();

const questions: Question[] = result.data.map((x) => ({
  title: x.target.title,
  url: `https://www.zhihu.com/question/${x.target.id}`,
}));

const yyyyMMdd = format(new Date(), "yyyy-MM-dd");
const fullPath = join("raw", `${yyyyMMdd}.json`);

let questionsAlreadyDownload: Question[] = [];
if (await exists(fullPath)) {
  const content = await Deno.readTextFile(fullPath);
  questionsAlreadyDownload = JSON.parse(content);
}

// 保存原始数据
const questionsAll = mergeQuestions(questions, questionsAlreadyDownload);
await Deno.writeTextFile(fullPath, JSON.stringify(questionsAll));

// 更新 README.md
const readme = await createReadme(questionsAll);
await Deno.writeTextFile("./README.md", readme);

// 更新 archives
const archiveText = createArchive(questionsAll, yyyyMMdd);
const archivePath = join("archives", `${yyyyMMdd}.md`);
await Deno.writeTextFile(archivePath, archiveText);
