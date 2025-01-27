"use server";

import { z } from "zod";
import shell from "shelljs";
import path from "path";
import fs from "fs";
import axios from "axios";

const githubToken = "your-github-pat"; // Replace with your GitHub PAT
const githubUsername = "your-github-username"; // Replace with your GitHub username

// Sub-function 1: Create PWA files in a temporary directory
function createPWAFiles(tempDir: string, validatedData: any) {
  // Create index.html with an embedded iframe
  const indexHtmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="${validatedData.themeColor}">
    <title>${validatedData.name}</title>
    <link rel="manifest" href="/manifest.json">
    <style>
      body, html {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
      }
      iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
    </style>
  </head>
  <body>
    <iframe src="${validatedData.url}" title="${validatedData.name}"></iframe>
  </body>
  </html>
  `;

  fs.writeFileSync(path.join(tempDir, "index.html"), indexHtmlContent);

  // Create manifest.json
  const manifestContent = {
    name: validatedData.name,
    short_name: validatedData.name,
    start_url: validatedData.url,
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

  // // If an icon was uploaded, save it to the temp directory
  // if (validatedData.icon) {
  //   const iconBuffer = validatedData.icon.arrayBuffer();
  //   fs.writeFileSync(
  //     path.join(tempDir, validatedData.icon.name),
  //     Buffer.from(iconBuffer)
  //   );
  // }
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
function pushFilesToRepo(
  tempDir: string,
  repoCloneUrl: string,
  githubUsername: string,
  githubToken: string
) {
  shell.cd(tempDir);

  // Initialize a Git repository
  shell.exec("git init");
  shell.exec("git add .");
  shell.exec('git commit -m "Initial commit with PWA files"');

  // Add the remote repository
  shell.exec(
    `git remote add origin https://${githubUsername}:${githubToken}@github.com/${githubUsername}/${path.basename(
      repoCloneUrl,
      ".git"
    )}.git`
  );

  // Push to the main branch
  shell.exec("git push -u origin main");

  console.log(`Pushed files to repository: ${repoCloneUrl}`);
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
    const response = await axios.put(
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
          Accept: "application/vnd.github.v3+json",
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

export async function convertToPWA(formData: FormData) {
  // Extract and validate the form data
  const url = formData.get("url") as string;
  const name = formData.get("name") as string;
  const themeColor = formData.get("themeColor") as string;
  const icon = formData.get("icon") as File | null;

  const validatedData = formSchema.parse({ url, name, themeColor, icon });
  console.log(validatedData);
  // Create a temporary directory to store the PWA files
  const tempDir = path.join(__dirname, "temp-pwa");
  shell.mkdir("-p", tempDir);

  // Step 1: Create PWA files
  createPWAFiles(tempDir, validatedData);

  // Step 2: Create a new GitHub repository
  const repoName = `${validatedData.name
    .toLowerCase()
    .replace(/\s+/g, "-")}-pwa`;

  const repoCreationResult = await createGitHubRepo(repoName, githubToken);

  // if (!repoCreationResult.success) {
  //   cleanupTempDir(tempDir);
  //   return {
  //     success: false,
  //     error: repoCreationResult.error,
  //   };
  // }

  // Step 3: Push files to the new repository
  pushFilesToRepo(
    tempDir,
    repoCreationResult.cloneUrl,
    githubUsername,
    githubToken
  );

  // Step 4: Enable GitHub Pages
  const pagesResult = await enableGitHubPages(repoName, githubToken);

  // if (!pagesResult.success) {
  //   cleanupTempDir(tempDir);
  //   return {
  //     success: false,
  //     error: pagesResult.error,
  //   };
  // }

  // Step 5: Clean up the temporary directory
  // cleanupTempDir(tempDir);

  // Return the PWA URL
  return {
    success: true,
    pwaUrl: pagesResult.pagesUrl, // GitHub Pages URL
  };
}
