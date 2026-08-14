import en from '@/messages/en.json';

type MessageTree = { readonly [key: string]: string | MessageTree };

export function t(path: string): string {
  const parts = path.split('.');
  let current: string | MessageTree = en as MessageTree;

  for (const part of parts) {
    if (typeof current !== 'object' || !(part in current)) {
      return path;
    }
    current = current[part];
  }

  return typeof current === 'string' ? current : path;
}
