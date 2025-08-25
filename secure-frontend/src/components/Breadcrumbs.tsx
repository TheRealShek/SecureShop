import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        <li>
          <div className="flex items-center">
            <HomeIcon className="h-5 w-5 text-gray-400" />
            <span className="ml-2 text-sm font-medium text-gray-500">Home</span>
          </div>
        </li>
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              <span
                className={`ml-2 text-sm font-medium ${
                  item.current
                    ? 'text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.label}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
