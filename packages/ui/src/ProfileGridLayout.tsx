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
  const [firstChild, secondChild, thirdChild] = React.Children.toArray(children);

  return (
    <div
      className={cn(
        'grid grid-cols-3 gap-10', // Three columns with a gap of 10px between them
        className
      )}
      style={{ gridTemplateColumns: '40% 30% 40%',
      overflowX: 'hidden', // Prevent horizontal scrolling

       }} // Set the column widths
    >
      {/* First column with left margin */}
      <div className="col-start-1 col-span-1 lg:col-start-1 lg:col-span-1">
        {firstChild} {/* Render the first child component */}
      </div>
      
      {/* Middle column */}
      <div className="col-start-2 col-span-1 lg:col-start-2 lg:col-span-1">
        {secondChild} {/* Render the second child component */}
      </div>
      
      {/* Third column with right margin */}
      <div className="col-start-3 col-span-1 lg:col-start-3 lg:col-span-1 mt-8">
        {thirdChild} {/* Render the third child component */}
      </div>
    </div>
  );
};




export const ProfileGridLayout: FC<GridProps> = ({
  children,
  className = '',
  classNameChild = ''
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
      <div className={cn('grid grid-cols-3 lg:grid-cols-3')}>
        {}
        <div className="col-span-3 lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ProfileGridItemThreeRows: FC<GridProps> = ({ children, className = '' }) => {
  return (
    <div className={cn('row-span-3 md:row-span-3 lg:row-span-3', className)}>
      {children}
    </div>
  );
};

export const ProfileGridItemFour: FC<GridProps> = ({ children, className = '' }) => {
  return (
    <div className={cn('col-span-11 md:col-span-11 lg:col-span-4', className)}>
      {children}
    </div>
  );
};

export const ProfileGridItemEight: FC<GridProps> = ({ children, className = '' }) => {
  return (
    <div
      className={cn('col-span-11 mb-5 md:col-span-11 lg:col-span-7', className)}
    >
      {children}
    </div>
  );
};

export const ProfileGridItemTwelve: FC<GridProps> = ({ children, className = '' }) => {
  return (
    <div
      className={cn(
        'col-span-12 mb-5 md:col-span-12 lg:col-span-12',
        className
      )}
    >
      {children}
    </div>
  );
};
