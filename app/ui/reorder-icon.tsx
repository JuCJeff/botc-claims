type ReorderIconProps = {
  className?: string;
  width?: number;
  height?: number;
};

const ReorderIcon = ({
  className = 'opacity-50',
  width = 16,
  height = 16,
}: ReorderIconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width}
      height={height}
      viewBox='0 0 24 24'
      fill='currentColor'
      className={className}
    >
      <circle cx='9' cy='6' r='1.5' />
      <circle cx='15' cy='6' r='1.5' />
      <circle cx='9' cy='12' r='1.5' />
      <circle cx='15' cy='12' r='1.5' />
      <circle cx='9' cy='18' r='1.5' />
      <circle cx='15' cy='18' r='1.5' />
    </svg>
  );
};

export default ReorderIcon;
