const messages = {
  extraSpaces: 'Remove leading, trailing, or duplicate spaces in className.',
  unsorted: 'Sort className tokens alphabetically.',
};

/**
 * Extract static string value from a JSX className attribute.
 * Returns null when the value is dynamic.
 */
function extractStaticClassValue(attribute) {
  const valueNode = attribute.value;
  if (!valueNode) {
    return null;
  }

  if (valueNode.type === 'Literal' && typeof valueNode.value === 'string') {
    return valueNode.value;
  }

  if (valueNode.type === 'JSXExpressionContainer') {
    const expr = valueNode.expression;

    if (expr.type === 'Literal' && typeof expr.value === 'string') {
      return expr.value;
    }

    if (expr.type === 'TemplateLiteral' && expr.expressions.length === 0) {
      const [quasi] = expr.quasis;
      return quasi?.value?.cooked ?? null;
    }
  }

  return null;
}

/**
 * Build a generic fixer that replaces the attribute value with a JSX string literal.
 */
function createFixer(fixer, attribute, nextValue) {
  const replacement = `"${nextValue}"`;
  return fixer.replaceText(attribute.value, replacement);
}

const sortClassnameRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensure JSX className strings are sorted alphabetically and free of redundant whitespace.',
    },
    messages,
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name !== 'className') {
          return;
        }

        const originalValue = extractStaticClassValue(node);
        if (typeof originalValue !== 'string') {
          return;
        }

        const normalized = originalValue.trim().replace(/\s+/g, ' ');
        const tokens = normalized.length > 0 ? normalized.split(' ') : [];
        const sortedTokens = [...tokens].sort((left, right) =>
          left.localeCompare(right, 'en-US', { sensitivity: 'base' }),
        );
        const sortedValue = sortedTokens.join(' ');

        const hasExtraSpaces = originalValue !== normalized;
        const isSorted =
          tokens.length <= 1 ||
          tokens.every((token, index) => token === sortedTokens[index]);

        if (!hasExtraSpaces && isSorted) {
          return;
        }

        if (!isSorted) {
          context.report({
            node: node.value,
            messageId: 'unsorted',
            fix(fixer) {
              return createFixer(fixer, node, sortedValue);
            },
          });
          return;
        }

        context.report({
          node: node.value,
          messageId: 'extraSpaces',
          fix(fixer) {
            return createFixer(fixer, node, sortedValue);
          },
        });
      },
    };
  },
};

export default sortClassnameRule;
