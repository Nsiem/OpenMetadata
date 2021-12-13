/*
 *  Copyright 2021 Collate
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { AxiosResponse } from 'axios';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
// import ReactTutorial from 'react-tutorial';
import { searchData } from '../../axiosAPIs/miscAPI';
import { PAGE_SIZE } from '../../constants/constants';
import { SearchIndex } from '../../enums/search.enum';
// import { useTour } from '../../hooks/useTour';

type Steps = {
  content: string;
  actionType: string;
  position: string;
  selector: string;
  userTypeText?: string;
  waitTimer?: number;
};

const getSteps = (value: string) => {
  return [
    {
      content: 'Click on the next.',
      actionType: 'click',
      position: 'bottom',
      selector: '#next',
    },
    {
      content: 'Click on the next.',
      actionType: 'click',
      position: 'bottom',
      selector: '#next',
    },
    {
      content: 'Click on Explore OpenMetadata.',
      actionType: 'click',
      position: 'bottom',
      selector: '#take-tour',
    },
    {
      content: 'Click on explore.',
      actionType: 'click',
      position: 'bottom',
      selector: '#explore',
    },
    {
      content: `Type "${value}" in search box.`,
      actionType: 'typing',
      userTypeText: value,
      position: 'bottom',
      selector: '#searchBox',
    },
    {
      content: 'Click on the table.',
      actionType: 'click',
      position: 'bottom',
      selector: '#bigqueryshopifydim_address',
    },
    {
      content:
        'Understand the schema of the table and add description, Claim ownership. Add tags etc..',
      position: 'bottom',
      selector: '#tabs',
      actionType: 'wait',
      waitTimer: 10000,
    },
    {
      content: 'Click here to explore more',
      actionType: 'click',
      position: 'bottom',
      selector: '#openmetadata_logo',
    },
  ];
};

const Tour = () => {
  // const { isTourOpen, handleIsTourOpen } = useTour();
  const [, setSteps] = useState<Steps[]>([]);

  useEffect(() => {
    searchData('', 1, PAGE_SIZE, '', '', '', SearchIndex.TABLE).then(
      (res: AxiosResponse) => {
        const table = res.data.hits.hits[0];
        setSteps(getSteps(table._source.table_name));
      }
    );
  }, []);

  return (
    <div>
      {/* {isTourOpen ? (
        <ReactTutorial
          disableKeyboardNavigation
          showNumber
          maskColor="#302E36"
          playTour={isTourOpen}
          showButtons={false}
          showNavigation={false}
          steps={steps}
          onRequestClose={() => handleIsTourOpen(false)}
        />
      ) : null} */}
    </div>
  );
};

export default observer(Tour);