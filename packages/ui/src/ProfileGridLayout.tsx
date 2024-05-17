import React, { FC, Children, ReactNode } from 'react'; // Import React and Children from 'react'
import cn from '../cn';

interface GridProps {
  children: ReactNode;
  className?: string;
  classNameChild?: string;
}

export const ThreeColumnContainer: FC<GridProps> = ({
  children,
  className = '',
}) => {
  const [firstChild, secondChild] = React.Children.toArray(children);

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-10', // Two columns with a gap of 10px between them
        className
      )}
      style={{
        overflowX: 'hidden', // Prevent horizontal scrolling
      }}
    >
      {/* First column */}
      <div className="col-span-1">
        {firstChild} {/* Render the first child component */}
      </div>

      {/* Second column */}
      <div className="col-span-1 mt-8 lg:mt-0">
        {secondChild} {/* Render the second child component */}
      </div>
    </div>
  );
};

export const ProfileGridLayout: FC<GridProps> = ({
  children,
  className = '',
}) => {
  const coverWidth = 850; // Hard code the cover width

  return (
    <div
      className={cn(
        ' mb-2 mt-8 max-w-screen-xl grow px-0 border-l border-r',
        className
      )}
      style={{
        maxWidth: `${coverWidth}px`,
        height: '100vh',
        borderLeftColor: 'grey',
        borderRightColor: 'grey',
      }}
    >
      {children}
    </div>
  );
};

export const ProfileGridItemThreeRows: FC<GridProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={cn('row-span-3 md:row-span-3 lg:row-span-3', className)}>
      {children}
    </div>
  );
};

export const ProfileGridItemFour: FC<GridProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={cn('col-span-1 md:col-span-1 lg:col-span-1', className)}>
      {children}
    </div>
  );
};

export const ProfileGridItemEight: FC<GridProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={cn('col-span-1 md:col-span-1 lg:col-span-1', className)}>
      {children}
    </div>
  );
};

export const ProfileGridItemTwelve: FC<GridProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={cn('col-span-1 md:col-span-1 lg:col-span-1', className)}>
      {children}
    </div>
  );
};
