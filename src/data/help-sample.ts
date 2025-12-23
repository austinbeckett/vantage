import type { Category } from '../types/help'

export const sampleCategories: Category[] = [
  {
    id: 'cat-001',
    name: 'Getting Started',
    description: 'Learn the basics of navigating and using Vantage',
    icon: 'rocket',
    articleCount: 4,
    articles: [
      {
        id: 'art-001',
        title: 'Welcome to Vantage',
        summary: 'An introduction to the Vantage platform and its core capabilities',
        content: `Vantage is your command center for pharmaceutical regulatory intelligence in Canada. The platform aggregates data from Health Canada's Drug Product Database (DPD), Notice of Compliance (NOC) database, and Generic Submissions Under Review (GSUR) into a unified, searchable interface.

## What You Can Do

- **Search & Discovery**: Explore the complete Canadian drug landscape with powerful filters
- **Watchlists**: Create custom surveillance lists to monitor specific molecules, competitors, or therapeutic areas
- **Competitive Intelligence**: Analyze market trends, competitor activity, and approval timelines
- **Real-time Alerts**: Get notified when regulatory changes affect your areas of interest

## Navigation

Use the sidebar to navigate between sections. The Dashboard provides a quick overview of recent activity and alerts.`,
        relatedArticles: ['art-002', 'art-003']
      },
      {
        id: 'art-002',
        title: 'Understanding the Dashboard',
        summary: 'How to use your personalized command center',
        content: `The Dashboard is your home base in Vantage, providing a real-time view of regulatory activity relevant to your interests.

## Key Components

### Activity Feed
Shows recent regulatory changes across all your watchlists. Events are color-coded by type:
- **Green**: Approvals and positive status changes
- **Amber**: New submissions and updates
- **Red**: Discontinuations or negative changes

### Notification Inbox
Displays alerts triggered by your watchlist criteria. Click any notification to see details and take action.

### Quick Stats
At-a-glance metrics showing your active watchlists, pending alerts, and recent activity volume.`,
        relatedArticles: ['art-001', 'art-005']
      },
      {
        id: 'art-003',
        title: 'Navigating Search & Discovery',
        summary: 'How to find drugs, manufacturers, and regulatory data',
        content: `The Search & Discovery section lets you explore Health Canada's pharmaceutical data with powerful filtering options.

## Using Filters

Combine multiple filters to narrow your search:
- **Active Ingredient**: Search by molecule name or API
- **Manufacturer**: Filter by company name
- **Therapeutic Area**: Browse by ATC classification
- **Status**: Filter by approval status (Marketed, Approved, Under Review, etc.)
- **Route of Administration**: Oral, Injectable, Topical, etc.

## Search Tips

- Use partial names for broader results
- Combine filters for precise targeting
- Save frequent searches as watchlists for ongoing monitoring`,
        relatedArticles: ['art-001', 'art-004']
      },
      {
        id: 'art-004',
        title: 'Your Account Settings',
        summary: 'Managing your profile, preferences, and notifications',
        content: `Access Settings from the sidebar to customize your Vantage experience.

## Profile
Update your name, email, and password. Your email is used for alert notifications.

## Notification Preferences
Control how and when you receive alerts:
- **Email Frequency**: Real-time, daily digest, or weekly summary
- **Alert Types**: Choose which event types trigger notifications

## Application Preferences
- **Theme**: Light or dark mode
- **Timezone**: Set your local timezone for accurate timestamps
- **Startup Screen**: Choose which section loads when you log in`,
        relatedArticles: ['art-002']
      }
    ]
  },
  {
    id: 'cat-002',
    name: 'Managing Watchlists',
    description: 'Create and organize your regulatory surveillance lists',
    icon: 'list',
    articleCount: 4,
    articles: [
      {
        id: 'art-005',
        title: 'Creating Your First Watchlist',
        summary: 'Step-by-step guide to setting up regulatory monitoring',
        content: `Watchlists are the core of Vantage's surveillance capabilities. They let you monitor specific combinations of criteria and get alerted when changes occur.

## Steps to Create a Watchlist

1. Navigate to **Watchlists** in the sidebar
2. Click **Create Watchlist**
3. Enter a descriptive name (e.g., "Competitor Cardiovascular Products")
4. Add one or more watchlist items with your monitoring criteria
5. Save your watchlist

## Choosing Criteria

Each watchlist item can include:
- Active ingredient(s)
- Manufacturer(s)
- Therapeutic area(s)
- Route of administration
- Dosage form

The more specific your criteria, the more targeted your alerts will be.`,
        relatedArticles: ['art-006', 'art-007']
      },
      {
        id: 'art-006',
        title: 'Editing and Organizing Watchlists',
        summary: 'How to update, rename, and manage your watchlists',
        content: `Keep your watchlists organized and up-to-date as your monitoring needs evolve.

## Editing a Watchlist

1. Open the watchlist you want to edit
2. Click the **Edit** button (pencil icon)
3. Modify the name, description, or criteria
4. Save your changes

## Adding New Items

You can add multiple monitoring criteria to a single watchlist. This is useful for tracking related products or competitors together.

## Archiving vs. Deleting

- **Archive**: Temporarily disable a watchlist without losing its configuration
- **Delete**: Permanently remove a watchlist and its history

Archived watchlists can be restored at any time from the Archive section.`,
        relatedArticles: ['art-005', 'art-008']
      },
      {
        id: 'art-007',
        title: 'Understanding Watchlist Alerts',
        summary: 'How alerts are triggered and what they mean',
        content: `When a drug product matching your watchlist criteria changes status, Vantage generates an alert.

## Alert Types

- **New Submission**: A generic application has been filed
- **Status Change**: A product moved to a new regulatory stage
- **Approval**: NOC granted for a product
- **Discontinuation**: Product removed from market

## Alert Delivery

Alerts appear in:
1. Your Dashboard notification inbox
2. Email (based on your notification preferences)

## Taking Action

Click any alert to see full details, including:
- What changed
- When it changed
- Link to the full product record`,
        relatedArticles: ['art-005', 'art-004']
      },
      {
        id: 'art-008',
        title: 'Watchlist Best Practices',
        summary: 'Tips for effective regulatory monitoring',
        content: `Get the most out of Vantage with these watchlist strategies.

## Be Specific
Broad criteria generate more alerts. Start specific and expand if needed.

## Use Descriptive Names
Name watchlists by their purpose: "Q1 Patent Expiry Molecules" is clearer than "Watchlist 3"

## Review Regularly
Schedule monthly reviews to archive outdated watchlists and refine criteria.

## Combine with Competitive Intelligence
Use watchlist data alongside the CI dashboard for deeper market insights.

## Organize by Priority
Create separate watchlists for high-priority monitoring vs. general awareness.`,
        relatedArticles: ['art-005', 'art-006']
      }
    ]
  },
  {
    id: 'cat-003',
    name: 'Competitive Intelligence',
    description: 'Analyze market trends and competitor activity',
    icon: 'chart',
    articleCount: 3,
    articles: [
      {
        id: 'art-009',
        title: 'Using the CI Dashboard',
        summary: 'Navigate the competitive intelligence overview',
        content: `The Competitive Intelligence dashboard provides a visual overview of the Canadian pharmaceutical market.

## Dashboard Components

### Key Metrics
Top-level numbers showing competitors tracked, recent approvals, pending reviews, and average approval times.

### Activity Feed
Recent regulatory events from all tracked competitors, filterable by time range and therapeutic area.

### Market Share Charts
Donut charts showing distribution by therapeutic area and by manufacturer.

### Top Competitors
Ranked list of competitors by market presence, with quick stats on each.

## Filtering Data

Use the time range selector (1yr, 3yr, 5yr, All Time) and therapeutic area filter to focus your analysis.`,
        relatedArticles: ['art-010', 'art-011']
      },
      {
        id: 'art-010',
        title: 'Analyzing Competitor Profiles',
        summary: 'Deep dive into individual competitor data',
        content: `Click any competitor to see their detailed profile and regulatory history.

## Profile Contents

- **Company Overview**: Headquarters, total products, market share
- **Portfolio Breakdown**: Products by therapeutic area
- **Timeline**: Historical approvals and submissions
- **Recent Activity**: Latest regulatory events

## Comparing Competitors

Use the "Compare" feature to see side-by-side analysis of multiple competitors.

## Setting Your Company

Configure "My Company" in Settings to see how your organization compares to competitors in the market.`,
        relatedArticles: ['art-009', 'art-011']
      },
      {
        id: 'art-011',
        title: 'Saving and Exporting Reports',
        summary: 'Save custom views and export data',
        content: `Preserve your analysis and share insights with your team.

## Saving Views

1. Configure your desired filters and view
2. Click **Save View**
3. Enter a name and description
4. Access saved views from the dropdown menu

## Exporting Data

Click the **Export** button to download:
- **PDF**: Formatted report suitable for presentations
- **Excel**: Raw data for further analysis

Exports include all currently visible data based on your active filters.`,
        relatedArticles: ['art-009']
      }
    ]
  },
  {
    id: 'cat-004',
    name: 'Understanding the Data',
    description: 'Learn about Health Canada databases and regulatory processes',
    icon: 'database',
    articleCount: 4,
    articles: [
      {
        id: 'art-012',
        title: 'Health Canada Data Sources',
        summary: 'Overview of DPD, NOC, and GSUR databases',
        content: `Vantage aggregates data from three primary Health Canada sources.

## Drug Product Database (DPD)
The official registry of all drugs approved for sale in Canada. Contains product details, active ingredients, manufacturers, and current status.

## Notice of Compliance (NOC) Database
Records of drug approvals issued by Health Canada. Shows when products received marketing authorization.

## Generic Submissions Under Review (GSUR)
Public listing of generic drug applications currently being evaluated. Provides early visibility into upcoming generic competition.

## Data Updates
Vantage syncs with Health Canada sources daily to ensure you have the latest information.`,
        relatedArticles: ['art-013', 'art-014']
      },
      {
        id: 'art-013',
        title: 'Drug Product Statuses Explained',
        summary: 'What each regulatory status means',
        content: `Understanding product statuses helps you interpret regulatory changes.

## Common Statuses

- **Marketed**: Product is approved and actively sold in Canada
- **Approved**: NOC granted but not yet marketed
- **Under Review**: Application submitted, awaiting decision
- **Cancelled**: Approval withdrawn at manufacturer's request
- **Dormant**: Approved but not currently marketed
- **Expired**: DIN no longer valid

## Status Transitions

Typical progression:
1. Under Review → Approved → Marketed
2. Marketed → Dormant (temporary) → Marketed
3. Marketed → Cancelled (permanent withdrawal)`,
        relatedArticles: ['art-012', 'art-007']
      },
      {
        id: 'art-014',
        title: 'ATC Classification System',
        summary: 'How drugs are categorized by therapeutic use',
        content: `The Anatomical Therapeutic Chemical (ATC) classification organizes drugs by their therapeutic purpose.

## Classification Levels

1. **Anatomical**: Main body system (e.g., Cardiovascular)
2. **Therapeutic**: Therapeutic subgroup (e.g., Antihypertensives)
3. **Pharmacological**: Pharmacological subgroup
4. **Chemical**: Chemical subgroup
5. **Substance**: Individual chemical substance

## Using ATC in Vantage

Filter by therapeutic area in Search & Discovery and Competitive Intelligence to focus on specific drug classes.

Watchlists can also target specific ATC categories for monitoring.`,
        relatedArticles: ['art-012', 'art-003']
      },
      {
        id: 'art-015',
        title: 'Generic Drug Approval Process',
        summary: 'How generic applications move through Health Canada',
        content: `Understanding the generic approval pathway helps you anticipate market changes.

## ANDS Process

Abbreviated New Drug Submissions (ANDS) are the pathway for generic approvals:

1. **Submission**: Manufacturer files ANDS with Health Canada
2. **Screening**: Initial review for completeness
3. **Review**: Scientific evaluation (typically 12-18 months)
4. **NOC Issuance**: Approval granted
5. **Market Entry**: Product launch

## GSUR Visibility

The GSUR database shows submissions at the review stage, giving you advance notice of potential generic competition.

## Monitoring Tips

Set watchlists for molecules with upcoming patent expiries to track generic submissions early.`,
        relatedArticles: ['art-012', 'art-013']
      }
    ]
  },
  {
    id: 'cat-005',
    name: 'Troubleshooting',
    description: 'Solutions to common issues and questions',
    icon: 'help',
    articleCount: 3,
    articles: [
      {
        id: 'art-016',
        title: 'Why Am I Not Receiving Alerts?',
        summary: 'Troubleshoot missing notifications',
        content: `If you're not receiving expected alerts, check these common causes.

## Check Your Watchlist Criteria

Verify your watchlist items match the products you want to monitor:
- Spelling of active ingredients
- Correct manufacturer names
- Appropriate status filters

## Check Notification Settings

1. Go to **Settings** > **Notifications**
2. Ensure email notifications are enabled
3. Verify your email address is correct
4. Check your preferred frequency (real-time vs. digest)

## Check Your Email

- Look in spam/junk folders
- Add noreply@vantage.com to your contacts
- Check if your organization blocks external emails`,
        relatedArticles: ['art-007', 'art-004']
      },
      {
        id: 'art-017',
        title: 'Search Not Finding Expected Results',
        summary: 'Tips for improving search accuracy',
        content: `If search isn't returning expected results, try these approaches.

## Broaden Your Search

- Use partial names instead of full names
- Remove filters one at a time to identify the limiting factor
- Try alternative spellings or naming conventions

## Check Data Availability

Not all historical data may be available. Vantage includes data from the current Health Canada databases, which have their own coverage limitations.

## Common Issues

- **Manufacturer names**: Companies may be listed under parent company names
- **Active ingredients**: Use the INN (International Nonproprietary Name) spelling
- **Recent changes**: Allow 24 hours for new Health Canada data to appear`,
        relatedArticles: ['art-003', 'art-012']
      },
      {
        id: 'art-018',
        title: 'Account and Login Issues',
        summary: 'Resolve access problems',
        content: `Having trouble accessing your account? Try these steps.

## Forgot Password

1. Click "Forgot Password" on the login page
2. Enter your email address
3. Check your inbox for the reset link
4. Create a new password

## Account Locked

After multiple failed login attempts, accounts are temporarily locked. Wait 15 minutes and try again, or contact your administrator.

## Browser Issues

Vantage works best with:
- Chrome (recommended)
- Firefox
- Safari
- Edge

Clear your browser cache if you experience display issues.

## Need More Help?

Contact your organization's Vantage administrator or email support@vantage.com.`,
        relatedArticles: ['art-004']
      }
    ]
  }
]
