import classNames from 'classnames';
import { lowerCase, upperCase } from 'lodash';
import { ColumnJoin, ColumnJoins, ColumnTags, TableColumn } from 'Models';
import React, {
  Fragment,
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { getDatasetDetailsPath } from '../../constants/constants';
import {
  getPartialNameFromFQN,
  getTableFQNFromColumnFQN,
  isEven,
} from '../../utils/CommonUtils';
import { stringToHTML } from '../../utils/StringsUtils';
import SVGIcons from '../../utils/SvgUtils';
import { getConstraintIcon } from '../../utils/TableUtils';
import { getTagCategories, getTaglist } from '../../utils/TagsUtils';
// import { EditSchemaColumnModal } from '../Modals/EditSchemaColumnModal/EditSchemaColumnModal';
import { ModalWithMarkdownEditor } from '../Modals/ModalWithMarkdownEditor/ModalWithMarkdownEditor';
import TagsContainer from '../tags-container/tags-container';
import Tags from '../tags/tags';

type Props = {
  columns: Array<TableColumn>;
  joins: Array<ColumnJoins>;
  searchText?: string;
  onUpdate: (columns: Array<TableColumn>) => void;
};

const SchemaTable: FunctionComponent<Props> = ({
  columns,
  joins,
  searchText = '',
  onUpdate,
}: Props) => {
  const [editColumn, setEditColumn] = useState<{
    column: TableColumn;
    index: number;
  }>();

  const [editColumnTag, setEditColumnTag] = useState<{
    column: TableColumn;
    index: number;
  }>();

  const [searchedColumns, setSearchedColumns] = useState<Array<TableColumn>>(
    []
  );

  const [allTags, setAllTags] = useState<Array<string>>([]);
  const rowRef = useRef<HTMLTableRowElement>(null);
  const getDataTypeString = (dataType: string): string => {
    switch (upperCase(dataType)) {
      case 'STRING':
      case 'CHAR':
      case 'TEXT':
      case 'VARCHAR':
      case 'MEDIUMTEXT':
      case 'MEDIUMBLOB':
      case 'BLOB':
        return 'varchar';
      case 'TIMESTAMP':
      case 'TIME':
        return 'timestamp';
      case 'INT':
      case 'FLOAT':
      case 'SMALLINT':
      case 'BIGINT':
      case 'NUMERIC':
      case 'TINYINT':
        return 'numeric';
      case 'BOOLEAN':
      case 'ENUM':
        return 'boolean';
      default:
        return dataType;
    }
  };

  const handleClick = () => {
    if (rowRef.current) {
      rowRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
        block: 'nearest',
      });
    }
  };

  const checkIfJoinsAvailable = (columnName: string): boolean => {
    return (
      joins &&
      Boolean(joins.length) &&
      Boolean(joins.find((join) => join.columnName === columnName))
    );
  };

  const getFrequentlyJoinedWithColumns = (
    columnName: string
  ): Array<ColumnJoin> => {
    return (
      joins.find((join) => join.columnName === columnName)?.joinedWith || []
    );
  };

  const fetchTags = () => {
    getTagCategories().then((res) => {
      if (res.data) {
        setAllTags(getTaglist(res.data));
      }
    });
  };

  const updateColumnTags = (
    column: TableColumn,
    index: number,
    selectedTags: Array<string>
  ) => {
    const prevTags = column.tags.filter((tag) => {
      return selectedTags.includes(tag.tagFQN);
    });

    const newTags: Array<ColumnTags> = selectedTags
      .filter((tag) => {
        return !prevTags.map((prevTag) => prevTag.tagFQN).includes(tag);
      })
      .map((tag) => ({
        labelType: 'Manual',
        state: 'Confirmed',
        tagFQN: tag,
      }));
    const updatedTags = [...prevTags, ...newTags];
    const updatedColumns = [
      ...columns.slice(0, index),
      {
        ...column,
        tags: updatedTags,
      },
      ...columns.slice(index + 1),
    ];
    onUpdate(updatedColumns);
  };

  const handleEditColumnTag = (column: TableColumn, index: number): void => {
    setEditColumnTag({ column, index });
  };

  const handleTagSelection = (selectedTags?: Array<ColumnTags>) => {
    const newSelectedTags = selectedTags?.map((tag) => tag.tagFQN);
    if (newSelectedTags && editColumnTag) {
      updateColumnTags(
        editColumnTag.column,
        editColumnTag.index,
        newSelectedTags
      );
    }
    setEditColumnTag(undefined);
  };

  const handleEditColumn = (column: TableColumn, index: number): void => {
    setEditColumn({ column, index });
  };

  const closeEditColumnModal = (): void => {
    setEditColumn(undefined);
  };

  const handleEditColumnChange = (columnDescription: string): void => {
    if (editColumn) {
      const updatedColumns = [
        ...columns.slice(0, editColumn.index),
        {
          ...editColumn.column,
          description: columnDescription,
        },
        ...columns.slice(editColumn.index + 1),
      ];
      onUpdate(updatedColumns);
    }
  };
  useEffect(() => {
    if (!searchText) {
      setSearchedColumns(columns);
    } else {
      const searchCols = columns.filter((column) => {
        return (
          lowerCase(column.name).includes(searchText) ||
          lowerCase(column.description).includes(searchText) ||
          lowerCase(getDataTypeString(column.columnDataType)).includes(
            searchText
          )
        );
      });
      setSearchedColumns(searchCols);
    }
  }, [searchText, columns]);

  useEffect(() => {
    closeEditColumnModal();
  }, [columns]);

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <>
      <table className="tw-w-full" data-testid="schema-table">
        <thead>
          <tr className="tableHead-row">
            <th className="tableHead-cell">Column Name</th>
            <th className="tableHead-cell">Data Type</th>
            <th className="tableHead-cell">Description</th>
            <th className="tableHead-cell tw-w-60">Tags</th>
          </tr>
        </thead>
        <tbody className="tableBody">
          {searchedColumns.map((column, index) => {
            return (
              <tr
                className={classNames(
                  'tableBody-row',
                  !isEven(index + 1) ? 'odd-row' : null
                )}
                data-testid="column"
                id={column.name}
                key={index}
                ref={rowRef}>
                <td className="tw-relative tableBody-cell">
                  {getConstraintIcon(column.columnConstraint)}
                  <span>{column.name}</span>
                </td>

                <td className="tableBody-cell">
                  <span>
                    {column.columnDataType
                      ? lowerCase(getDataTypeString(column.columnDataType))
                      : ''}
                  </span>
                </td>
                <td className="tw-group tableBody-cell tw-relative">
                  <div>
                    <div
                      className="child-inline tw-cursor-pointer hover:tw-underline"
                      data-testid="description"
                      id={`column-description-${index}`}
                      onClick={() => handleEditColumn(column, index)}>
                      {stringToHTML(column.description) || (
                        <span className="tw-no-description">
                          No description added
                        </span>
                      )}
                      <button className="tw-opacity-0 tw-ml-1 group-hover:tw-opacity-100 focus:tw-outline-none">
                        <SVGIcons
                          alt="edit"
                          icon="icon-edit"
                          title="edit"
                          width="10px"
                        />
                      </button>
                    </div>
                    {checkIfJoinsAvailable(column.name) && (
                      <div className="tw-mt-3">
                        <span className="tw-text-gray-400 tw-mr-1">
                          Frequently joined columns:
                        </span>
                        {getFrequentlyJoinedWithColumns(column.name).map(
                          (columnJoin, index) => (
                            <Fragment key={index}>
                              {index > 0 && <span className="tw-mr-1">,</span>}
                              <Link
                                className="link-text"
                                to={getDatasetDetailsPath(
                                  getTableFQNFromColumnFQN(
                                    columnJoin.fullyQualifiedName
                                  ),
                                  getPartialNameFromFQN(
                                    columnJoin.fullyQualifiedName,
                                    ['column']
                                  )
                                )}
                                onClick={handleClick}>
                                {getPartialNameFromFQN(
                                  columnJoin.fullyQualifiedName,
                                  ['database', 'table', 'column']
                                )}
                              </Link>
                            </Fragment>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td
                  className="tw-group tw-relative tableBody-cell"
                  onClick={() => {
                    if (!editColumnTag) {
                      handleEditColumnTag(column, index);
                    }
                  }}>
                  <TagsContainer
                    editable={editColumnTag?.index === index}
                    selectedTags={column.tags}
                    tagList={allTags}
                    onCancel={() => {
                      handleTagSelection();
                    }}
                    onSelectionChange={(tags) => {
                      handleTagSelection(tags);
                    }}>
                    {column.tags.length ? (
                      <button className="tw-opacity-0 tw-ml-1 group-hover:tw-opacity-100 focus:tw-outline-none">
                        <SVGIcons
                          alt="edit"
                          icon="icon-edit"
                          title="edit"
                          width="10px"
                        />
                      </button>
                    ) : (
                      <span className="tw-opacity-0 group-hover:tw-opacity-100">
                        <Tags
                          className="tw-border-gray-500"
                          tag="+ Add new tag"
                          type="outlined"
                        />
                      </span>
                    )}
                  </TagsContainer>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {editColumn && (
        <ModalWithMarkdownEditor
          header={`Edit column: "${editColumn.column.name}"`}
          placeholder="Enter Column Description"
          value={editColumn.column.description}
          onCancel={closeEditColumnModal}
          onSave={handleEditColumnChange}
        />
      )}
    </>
  );
};

export default SchemaTable;