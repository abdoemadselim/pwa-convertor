"use server";

import { z } from "zod";
import shell from "shelljs";
import path from "path";
import fs from "fs";
import axios from "axios";
import { exec } from "child_process";
import util from "util";
import sharp from "sharp";

const execAsync = util.promisify(exec);
const githubToken = process.env.GITHUB_TOKEN || ""; // Replace with your GitHub PAT
const githubUsername = process.env.GITHUB_USER_NAME || ""; // Replace with your GitHub username

// Sub-function 1: Create PWA files in a temporary directory
async function createPWAFiles(tempDir: string, validatedData: any, repoName: string) {
  // Create index.html with an embedded iframe
  const indexHtmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="theme-color" content="${validatedData.themeColor}">
      <title>${validatedData.name}</title>
      <link rel="manifest" href="manifest.json" />
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        embed {
          width: 100vw;
          height: 100vh;
        }
      </style>
    </head>
    <body>
        <embed type="text/html" src="${validatedData.url}" />
    </body>
    </html>
  `;

  fs.writeFileSync(path.join(tempDir, "index.html"), indexHtmlContent);

  // Create manifest.json
  const manifestContent = {
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

  fs.writeFileSync(
    path.join(tempDir, "manifest.json"),
    JSON.stringify(manifestContent, null, 2)
  );

  const files = [
    { name: "manifest.json", content: manifestContent },
    { name: "index.html", content: indexHtmlContent },
  ]
  // If an icon was uploaded, save it to the temp directory
  if (validatedData.icon) {
    const iconBuffer = await validatedData.icon.arrayBuffer();
    const resizedIconBuffer = await sharp(Buffer.from(iconBuffer))
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toBuffer();
    fs.writeFileSync(
      path.join(tempDir, validatedData.icon.name),
      Buffer.from(resizedIconBuffer)
    );
  }

  return files;
}

// Sub-function 2: Create a new GitHub repository
async function createGitHubRepo(repoName: string, githubToken: string) {
  try {
    const response = await axios.post(
      "https://api.github.com/user/repos",
      {
        name: repoName,
        private: false, // Set to true for private repositories
        auto_init: false, // Do not initialize with a README
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
      cloneUrl: response.data.clone_url,
    };
  } catch (error) {
    console.error("Error creating GitHub repository:", error);
    return {
      success: false,
      error: "Failed to create GitHub repository.",
    };
  }
}

// Sub-function 3: Push files to the GitHub repository
async function pushFilesToRepo(
  tempDir: string,
  repoCloneUrl: string,
  githubUsername: string,
  githubToken: string
) {
  try {
    console.log(`Changing directory to: ${tempDir}`);
    process.chdir(tempDir);

    const commands = [
      "git init",
      "git add .",
      'git commit -m "Initial commit with PWA files"',
      "git branch -M main",
      `git remote add origin https://${githubUsername}:${githubToken}@github.com/${githubUsername}/${path.basename(
        repoCloneUrl,
        ".git"
      )}.git`,
      "git push -u origin main",
    ];

    for (const command of commands) {
      await execAsync(command);
    }

    return true;
  } catch (error) {
    console.error("Error in Git operations:", error);
    return false;
  }
}

// Sub-function 4: Clean up the temporary directory
function cleanupTempDir(tempDir: string) {
  shell.rm("-rf", tempDir);
  console.log(`Cleaned up temporary directory: ${tempDir}`);
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

// Sub-function 5: Enable GitHub Pages for the repository
async function enableGitHubPages(repoName: string, githubToken: string) {
  try {
    const response = await axios.post(
      `https://api.github.com/repos/${githubUsername}/${repoName}/pages`,
      {
        source: {
          branch: "main", // Set the branch to 'main' or 'gh-pages'
          path: "/", // Serve from the root of the branch
        },
      },
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    return {
      success: true,
      pagesUrl: response.data.html_url, // GitHub Pages URL
    };
  } catch (error) {
    console.error("Error enabling GitHub Pages:", error);
    return {
      success: false,
      error: "Failed to enable GitHub Pages.",
    };
  }
}
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function convertToPWA(formData: FormData) {
  // Extract and validate the form data
  const url = formData.get("url") as string;
  const name = formData.get("name") as string;
  const themeColor = formData.get("themeColor") as string;
  const icon = formData.get("icon") as File | null;

  const validatedData = formSchema.parse({ url, name, themeColor, icon });
  // Create a temporary directory to store the PWA files
  const tempDir = path.join(__dirname, "temp-pwa");
  shell.mkdir("-p", tempDir);

  // Step 1: Create PWA files
  const files = createPWAFiles(tempDir, validatedData, name);

  // Step 2: Create a new GitHub repository
  const repoName = `${validatedData.name
    .toLowerCase()
    .replace(/\s+/g, "-")}-pwa`;

  const repoCreationResult = await createGitHubRepo(repoName, githubToken);

  if (!repoCreationResult.success) {
    cleanupTempDir(tempDir);
    return {
      success: false,
      error: repoCreationResult.error,
    };
  }

  // Step 3: Push files to the new repository
  pushFilesToRepo(
    tempDir,
    repoCreationResult.cloneUrl,
    githubUsername,
    githubToken
  );

  // Step 4: Enable GitHub Pages
  await delay(10000); // Wait 5 seconds
  let pagesResult = await enableGitHubPages(repoName, githubToken);
  // Step 5: Clean up the temporary directory
  if (!pagesResult.success) {
    return {
      success: false,
      error: pagesResult.error,
    };
  }

  // cleanupTempDir(tempDir);

  // Return the PWA URL
  return {
    success: true,
    pwaUrl: pagesResult?.pagesUrl,
    files: files
  };
}
