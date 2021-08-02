import { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSuggestions } from '../../axiosAPIs/miscAPI';
import { getDatasetDetailsPath } from '../../constants/constants';

type SuggestionProp = {
  searchText: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};
type Option = {
  _source: {
    table_id: string;
    fqdn: string;
    table_name: string;
  };
};
const Suggestions = ({ searchText, isOpen, setIsOpen }: SuggestionProp) => {
  const [options, setOptions] = useState<Array<Option>>([]);

  useEffect(() => {
    getSuggestions(searchText).then((res: AxiosResponse) => {
      if (res.data) {
        setOptions(res.data.suggest['table-suggest'][0].options);
        setIsOpen(true);
      }
    });
  }, [searchText]);

  return (
    <>
      {options.length > 0 && isOpen ? (
        <>
          <button
            className="tw-z-10 tw-fixed tw-inset-0 tw-h-full tw-w-full tw-bg-black tw-opacity-0"
            onClick={() => setIsOpen(false)}
          />
          <div
            aria-labelledby="menu-button"
            aria-orientation="vertical"
            className="tw-origin-top-right tw-absolute tw-z-10
          tw-w-60 tw-mt-1 tw-rounded-md tw-shadow-lg 
        tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none"
            role="menu">
            <div className="py-1" role="none">
              {options.map((item: Option) => {
                const fqdn = item['_source'].fqdn;
                const name = item['_source'].table_name;

                return (
                  <Link
                    className="tw-text-gray-700 tw-block tw-px-4 tw-py-2 tw-text-sm 
                    hover:tw-bg-gray-200"
                    data-testid="data-name"
                    key={fqdn}
                    to={getDatasetDetailsPath(fqdn)}
                    onClick={() => setIsOpen(false)}>
                    {name}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default Suggestions;