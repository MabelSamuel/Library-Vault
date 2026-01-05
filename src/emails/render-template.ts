import fs from "fs";
import path from "path";

export const renderTemplate = (
  templateName: string,
  variables: Record<string, string>
) => {
  const templatePath = path.join(
    __dirname,
    "templates",
    `${templateName}.html`
  );

  let html = fs.readFileSync(templatePath, "utf-8");

  for (const key in variables) {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), variables[key]);
  }

  return html;
};
