import React from 'react';
import './DataTable.css';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

function DataTable<T>({ data, columns, onRowClick, isLoading }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="table-loader">
        <div className="spinner"></div>
        <p>Cargando información...</p>
      </div>
    );
  }

  return (
    <div className="table-container card-premium">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={col.className}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, i) => (
              <tr 
                key={i} 
                className={onRowClick ? 'clickable' : ''} 
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col, j) => (
                  <td key={j} className={col.className}>
                    {typeof col.accessor === 'function' 
                      ? col.accessor(item) 
                      : (item[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="no-data">
                No se encontraron resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
