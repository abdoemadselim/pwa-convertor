"use server";

import { z } from "zod";
import axios from "axios";
import sharp from "sharp";

const githubToken = process.env.GITHUB_TOKEN || "";
const githubUsername = process.env.GITHUB_USER_NAME || "";

async function createFileContent(content: string) {
  return Buffer.from(content).toString("base64");
}

async function uploadFileToGitHub(
  repoName: string,
  path: string,
  content: string | Buffer,
  message: string,
  isBinary: boolean = false
) {
  try {
    const encodedContent = isBinary
      ? content.toString("base64")
      : Buffer.from(content).toString("base64");

    await axios.put(
      `https://api.github.com/repos/${githubUsername}/${repoName}/contents/${path}`,
      {
        message,
        content: encodedContent,
        branch: "main",
      },
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    return true;
  } catch (error) {
    console.error(`Error uploading ${path}:`, error);
    return false;
  }
}

async function createGitHubRepo(repoName: string) {
  try {
    const response = await axios.post(
      "https://api.github.com/user/repos",
      {
        name: repoName,
        private: false,
        auto_init: true,
      },
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    return {
      success: true,
      repoUrl: response.data.html_url,
    };
  } catch (error) {
    console.error("Error creating GitHub repository:", error);
    return { success: false, error: "Failed to create GitHub repository." };
  }
}

async function enableGitHubPages(repoName: string) {
  try {
    const response = await axios.post(
      `https://api.github.com/repos/${githubUsername}/${repoName}/pages`,
      {
        source: {
          branch: "main",
          path: "/",
        },
      },
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    return { success: true, pagesUrl: response.data.html_url };
  } catch (error) {
    console.error("Error enabling GitHub Pages:", error);
    return { success: false, error: "Failed to enable GitHub Pages." };
  }
}

const formSchema = z.object({
  url: z.string().url(),
  name: z.string().min(1),
  themeColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  icon: z
    .instanceof(File)
    .refine((file) => file.type === "image/png", {
      message: "Only PNG files are allowed",
    })
    .optional(),
});

async function checkRepoExists(repoName: string): Promise<boolean> {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${githubUsername}/${repoName}`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    return response.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return false;
    }
    throw error;
  }
}

export async function convertToPWA(formData: FormData) {
  const validatedData = formSchema.parse({
    url: formData.get("url"),
    name: formData.get("name"),
    themeColor: formData.get("themeColor"),
    icon: formData.get("icon"),
  });

  const repoName = `${validatedData.name
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

    // Check if the repository already exists
  const repoExists = await checkRepoExists(repoName);
  console.log(repoExists)
  if (repoExists) {
    return { success: false, error: `this PWA Name "${repoName}" is not available. Please choose a different name.` };
  }

  // Create repository
  const repoResult = await createGitHubRepo(repoName);
  if (!repoResult.success) {
    return { success: false, error: `Something went wrong :(`};
  }

  // Create and upload index.html
  const indexHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="theme-color" content="${validatedData.themeColor}">
      <title>${validatedData.name}</title>
      <link rel="manifest" href="manifest.json" />
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        embed { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <embed type="text/html" src="${validatedData.url}" />
    </body>
    </html>
  `;

  // Create and upload manifest.json
  const manifest = {
    name: validatedData.name,
    short_name: validatedData.name,
    start_url: "./index.html",
    display: "standalone",
    background_color: validatedData.themeColor,
    theme_color: validatedData.themeColor,
    icons: validatedData.icon
      ? [
          {
            src: validatedData.icon.name,
            sizes: "192x192",
            type: "image/png",
          },
        ]
      : [],
  };

  // Upload files
  await uploadFileToGitHub(repoName, "index.html", indexHtml, "Add index.html");
  await uploadFileToGitHub(
    repoName,
    "manifest.json",
    JSON.stringify(manifest, null, 2),
    "Add manifest.json"
  );

  // Upload icon if provided
  if (validatedData.icon) {
    const iconBuffer = await validatedData.icon.arrayBuffer();
    const resizedIconBuffer = await sharp(Buffer.from(iconBuffer))
      .resize(192, 192, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer();

    await uploadFileToGitHub(
      repoName,
      validatedData.icon.name,
      resizedIconBuffer, // Pass the buffer directly
      "Add icon",
      true // Indicate this is a binary file
    );
  }

  // Enable GitHub Pages
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const pagesResult = await enableGitHubPages(repoName);

  if (!pagesResult.success) {
    return { success: false, error: "Something went wrong :(" };
  }

  return {
    success: true,
    pwaUrl: pagesResult.pagesUrl,
    files: [
      { name: "manifest.json", content: manifest },
      { name: "index.html", content: indexHtml },
    ],
  };
}
