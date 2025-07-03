# Contributing to BuildDiaspora Zimbabwe

Thank you for your interest in contributing to BuildDiaspora Zimbabwe! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Community](#community)

## Code of Conduct

### Our Pledge

We are committed to making participation in our project a harassment-free experience for everyone, regardless of:
- Age, body size, disability, ethnicity, gender identity and expression
- Level of experience, nationality, personal appearance, race, religion
- Sexual identity and orientation

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement

Project maintainers are responsible for clarifying standards and will take appropriate action in response to unacceptable behavior. Contact us at conduct@builddiaspora.com to report issues.

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js 18+ installed
- Git configured with your GitHub account
- Basic knowledge of React, TypeScript, and Next.js
- Familiarity with Tailwind CSS and Supabase

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/build-diaspora-zimbabwe.git
   cd build-diaspora-zimbabwe
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-org/build-diaspora-zimbabwe.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Set up environment** (see `docs/DEVELOPER_SETUP.md`)
6. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Process

### Workflow Overview

1. **Find or create an issue** describing the work
2. **Assign yourself** to the issue
3. **Create a feature branch** from `main`
4. **Make your changes** following our coding standards
5. **Write tests** for new functionality
6. **Update documentation** as needed
7. **Submit a pull request** for review
8. **Address feedback** and iterate
9. **Merge** when approved

### Branch Naming Convention

Use descriptive branch names with prefixes:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements
- `chore/` - Maintenance tasks

Examples:
- `feature/user-profile-verification`
- `fix/email-sending-error`
- `docs/api-endpoint-documentation`

### Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add email verification flow
fix(profile): resolve avatar upload issue
docs(api): update authentication endpoints
test(auth): add unit tests for login flow
```

## Coding Standards

### TypeScript Guidelines

- **Strict typing**: Use proper TypeScript types, avoid `any`
- **Interfaces**: Define interfaces for all data structures
- **Enums**: Use enums for constants and options
- **Generics**: Use generics for reusable components

```typescript
// Good
interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  isVerified: boolean;
}

// Bad
const userProfile: any = {
  id: "123",
  email: "user@example.com"
};
```

### React Component Guidelines

- **Functional components**: Use function components with hooks
- **Props interfaces**: Define TypeScript interfaces for all props
- **Default props**: Use default parameters instead of defaultProps
- **Component naming**: Use PascalCase for components

```typescript
// Good
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick 
}: ButtonProps) {
  return (
    <button 
      className={cn(buttonVariants({ variant, size }))}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Styling Guidelines

- **Tailwind CSS**: Use Tailwind classes for styling
- **Component variants**: Use `class-variance-authority` for component variants
- **Responsive design**: Mobile-first approach
- **Dark mode**: Support dark mode where applicable

```typescript
// Good - Using CVA for variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4 py-2",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);
```

### File Organization

```
src/
├── app/                    # Next.js app router
│   ├── (auth)/            # Route groups
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Basic UI components
│   ├── auth/             # Authentication components
│   └── forms/            # Form components
├── lib/                  # Utilities and configurations
│   ├── utils.ts          # General utilities
│   ├── validations.ts    # Zod schemas
│   └── constants.ts      # App constants
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── styles/               # Additional styles
```

### API Guidelines

- **RESTful design**: Follow REST principles
- **Error handling**: Consistent error responses
- **Validation**: Use Zod for request validation
- **Rate limiting**: Implement appropriate rate limits

```typescript
// Good - API route structure
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);
    
    // Process request
    const result = await createUser(validatedData);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Testing Guidelines

### Testing Strategy

- **Unit tests**: Test individual functions and components
- **Integration tests**: Test component interactions
- **E2E tests**: Test complete user workflows
- **API tests**: Test API endpoints

### Unit Testing

Use Jest and React Testing Library:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Testing

Use Playwright for end-to-end tests:

```typescript
import { test, expect } from '@playwright/test';

test('user can sign up and verify email', async ({ page }) => {
  await page.goto('/signup');
  
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'SecurePass123!');
  await page.click('[data-testid="signup-button"]');
  
  await expect(page.locator('[data-testid="verification-message"]')).toBeVisible();
});
```

### Test Coverage

Maintain minimum test coverage:
- **Overall**: 80%
- **Critical paths**: 95%
- **Utilities**: 90%
- **Components**: 85%

## Pull Request Process

### Before Submitting

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**:
   ```bash
   npm run test
   npm run test:e2e
   npm run lint
   npm run type-check
   ```

3. **Build successfully**:
   ```bash
   npm run build
   ```

### PR Template

When creating a pull request, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by at least one maintainer
3. **Testing** in staging environment
4. **Final approval** by project maintainer

### Review Criteria

Reviewers will check for:
- **Functionality**: Does it work as expected?
- **Code quality**: Is it readable and maintainable?
- **Performance**: Are there any performance implications?
- **Security**: Are there any security concerns?
- **Testing**: Are tests adequate and passing?
- **Documentation**: Is documentation updated?

## Issue Reporting

### Bug Reports

Use the bug report template and include:
- **Environment**: OS, browser, Node.js version
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Additional context**: Any other relevant information

### Feature Requests

Use the feature request template and include:
- **Problem description**: What problem does this solve?
- **Proposed solution**: Describe your suggested solution
- **Alternatives considered**: Other solutions you've thought about
- **Additional context**: Mockups, examples, etc.

### Issue Labels

We use labels to categorize issues:
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - High priority issues
- `status: in progress` - Currently being worked on

## Community

### Communication Channels

- **GitHub Discussions**: General questions and discussions
- **Issues**: Bug reports and feature requests
- **Pull Requests**: Code contributions
- **Email**: conduct@builddiaspora.com for Code of Conduct issues

### Recognition

We recognize contributors through:
- **Contributors list** in README
- **Release notes** mentions
- **Community highlights** in discussions
- **Contributor badges** (coming soon)

### Mentorship

New contributors can:
- **Start with good first issues**
- **Ask questions** in discussions
- **Request code reviews** from maintainers
- **Join pair programming** sessions (when available)

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Schedule

- **Major releases**: Quarterly
- **Minor releases**: Monthly
- **Patch releases**: As needed

### Changelog

All notable changes are documented in `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/) format.

---

Thank you for contributing to BuildDiaspora Zimbabwe! Your efforts help build a stronger community for Zimbabwean professionals worldwide. 🇿🇼

For questions or help getting started, feel free to open a discussion or reach out to the maintainers. 