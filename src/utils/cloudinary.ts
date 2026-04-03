export const extractPublicId = (url: string) => {
  const parts = url.split('/');
  const file = parts.pop();
  const folder = parts.slice(parts.indexOf('upload') + 1).join('/');

  const publicId = `${folder}/${file?.split('.')[0]}`;
  return publicId;
};