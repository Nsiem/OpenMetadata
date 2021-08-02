import { isNil } from 'lodash';
import React, { FunctionComponent } from 'react';
import { stringToHTML } from '../../../utils/StringsUtils';
import Tag from '../../tags/tags';

type Props = {
  description: string;
  extraInfo: {
    key: string;
    value?: string;
  }[];
  tags?: string[];
};

const TableDataCardBody: FunctionComponent<Props> = ({
  description,
  extraInfo,
  tags,
}: Props) => {
  return (
    <>
      <div className="tw-mb-1 description-text">
        {stringToHTML(description)}
      </div>
      <p className="tw-py-1">
        {extraInfo.map(({ key, value }, i) =>
          !isNil(value) ? (
            <span key={i}>
              <span className="tw-text-gray-500">{key} :</span>{' '}
              <span className="tw-pl-1 ">{value}</span>
              {i !== extraInfo.length - 1 && (
                <span className="tw-mx-3 tw-inline-block tw-text-gray-400">
                  •
                </span>
              )}
            </span>
          ) : null
        )}
      </p>
      {Boolean(tags?.length) && (
        <div className="tw-mt-1">
          <span>
            <i className="fas fa-tags tw-px-1 tw-text-xs tw-text-gray-500" />
          </span>
          {tags?.map((tag, index) => (
            <Tag
              className="tw-border-none tw-bg-gray-200"
              key={index}
              tag={`#${tag}`}
              type="contained"
            />
          ))}
        </div>
      )}
    </>
  );
};

export default TableDataCardBody;