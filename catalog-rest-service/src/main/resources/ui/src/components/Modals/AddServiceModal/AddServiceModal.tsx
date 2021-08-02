import React, { FunctionComponent, useState } from 'react';
import { Button } from '../../buttons/Button/Button';
// import { serviceType } from '../../../constants/services.const';

export type DatabaseObj = {
  description: string | undefined;
  ingestionSchedule:
    | {
        repeatFrequency: string;
        startDate: string;
      }
    | undefined;
  jdbc: {
    connectionUrl: string;
    driverClass: string;
  };
  name: string;
  serviceType: string;
};

export type DataObj = {
  connectionUrl: string;
  description: string;
  driverClass: string;
  href: string;
  id: string;
  jdbc: { driverClass: string; connectionUrl: string };
  name: string;
  serviceType: string;
  ingestionSchedule?: { repeatFrequency: string; startDate: string };
};

export type EditObj = {
  edit: boolean;
  id?: string;
};

type Props = {
  header: string;
  serviceName: string;
  serviceList: Array<DataObj>;
  data?: DataObj;
  onSave: (obj: DatabaseObj, text: string, editData: EditObj) => void;
  onCancel: () => void;
};

type ErrorMsg = {
  selectService: boolean;
  name: boolean;
  url: boolean;
  port: boolean;
  userName: boolean;
  password: boolean;
  driverClass: boolean;
};

const requiredField = (label: string) => (
  <>
    {label} <span className="tw-text-red-500">&nbsp;*</span>
  </>
);

const generateOptions = (count: number, initialValue = 0) => {
  return Array(count)
    .fill(null)
    .map((_, i) => (
      <option key={i + initialValue} value={i + initialValue}>
        {i + initialValue}
      </option>
    ));
};

const generateName = (data: Array<DataObj>) => {
  const newArr: string[] = [];
  data.forEach((d) => {
    newArr.push(d.name);
  });

  return newArr;
};

const seprateUrl = (url?: string) => {
  if (url) {
    const urlString = url?.split('://')[1] || url;
    const [idpwd, urlport] = urlString.split('@');
    const [userName, password] = idpwd.split(':');
    const [path, portwarehouse] = urlport.split(':');
    const [port, database] = portwarehouse.split('/');

    return { userName, password, path, port, database };
  }

  return {};
};

const fromISOString = (isoValue = '') => {
  if (isoValue) {
    // 'P1DT 0H 0M'
    const [d, hm] = isoValue.split('T');
    const day = +d.replace('D', '').replace('P', '');
    const [h, time] = hm.split('H');
    const minute = +time.replace('M', '');

    return { day, hour: +h, minute };
  } else {
    return {
      day: 1,
      hour: 0,
      minute: 0,
    };
  }
};

const errorMsg = (value: string) => {
  return (
    <div className="tw-mt-1">
      <strong className="tw-text-red-500 tw-text-xs tw-italic">{value}</strong>
    </div>
  );
};

export const AddServiceModal: FunctionComponent<Props> = ({
  header,
  serviceName,
  data,
  onSave,
  onCancel,
  serviceList,
}: Props) => {
  const [editData] = useState({ edit: !!data, id: data?.id });
  const [serviceType] = useState(['MySQL', 'Redshift', 'BigQuery']);
  const [parseUrl] = useState(seprateUrl(data?.connectionUrl) || {});
  const [existingNames] = useState(generateName(serviceList));
  const [ingestion, setIngestion] = useState(!!data?.ingestionSchedule);
  const [selectService, setSelectService] = useState(data?.serviceType || '');
  const [name, setName] = useState(data?.name || '');
  const [userName, setUserName] = useState(parseUrl?.userName || '');
  const [password, setPassword] = useState(parseUrl?.password || '');
  const [description, setDescription] = useState(data?.description || '');
  // const [tags, setTags] = useState('');
  const [url, setUrl] = useState(parseUrl?.path || '');
  const [port, setPort] = useState(parseUrl?.port || '');
  const [database, setDatabase] = useState(parseUrl?.database || '');
  const [driverClass, setDriverClass] = useState(data?.driverClass || 'jdbc');
  const [frequency, setFrequency] = useState(
    fromISOString(data?.ingestionSchedule?.repeatFrequency)
  );
  const [showErrorMsg, setShowErrorMsg] = useState({
    selectService: false,
    name: false,
    url: false,
    port: false,
    userName: false,
    password: false,
    driverClass: false,
  });
  const [sameNameError, setSameNameError] = useState(false);

  const handleChangeFrequency = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const name = event.target.name,
      value = +event.target.value;
    setFrequency({ ...frequency, [name]: value });
  };

  const handleValidation = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = event.target.value;
    const name = event.target.name;

    switch (name) {
      case 'selectService':
        setSelectService(value);

        break;

      case 'name':
        if (existingNames.includes(value.trim())) {
          setSameNameError(true);
        } else {
          setSameNameError(false);
        }
        setName(value);

        break;

      case 'url':
        setUrl(value);

        break;

      case 'port':
        setPort(value);

        break;

      case 'userName':
        setUserName(value);

        break;

      case 'password':
        setPassword(value);

        break;

      case 'driverClass':
        setDriverClass(value);

        break;

      default:
        break;
    }

    setShowErrorMsg({ ...showErrorMsg, [name]: false });
  };

  const onSaveHelper = (value: ErrorMsg) => {
    const { selectService, name, url, port, userName, password, driverClass } =
      value;

    return (
      !sameNameError &&
      !selectService &&
      !name &&
      !url &&
      !port &&
      !userName &&
      !password &&
      !driverClass
    );
  };

  const handleSave = () => {
    const setMsg = {
      selectService: !selectService,
      name: !name,
      url: !url,
      port: !port,
      userName: !userName,
      password: !password,
      driverClass: !driverClass,
    };
    setShowErrorMsg(setMsg);
    if (onSaveHelper(setMsg)) {
      const { day, hour, minute } = frequency;
      const date = new Date();
      const databaseObj: DatabaseObj = {
        description: description || undefined,
        ingestionSchedule: ingestion
          ? {
              repeatFrequency: `P${day}DT${hour}H${minute}M`,
              startDate: date.toISOString(),
            }
          : undefined,
        jdbc: {
          connectionUrl: `${userName}:${password}@${url}:${port}${
            database && '/' + database
          }`,
          driverClass: driverClass,
        },
        name: name,
        serviceType: selectService,
      };
      onSave(databaseObj, serviceName, editData);
    }
  };

  return (
    <dialog className="tw-modal">
      <div className="tw-modal-backdrop" />
      <div className="tw-modal-container tw-max-w-lg">
        <div className="tw-modal-header">
          <p className="tw-modal-title">{header}</p>
          <svg
            className="tw-w-6 tw-h-6 tw-cursor-pointer"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            onClick={onCancel}>
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="tw-modal-body">
          <form className="tw-min-w-full">
            <div>
              <label className="tw-block tw-form-label" htmlFor="selectService">
                {requiredField('Select Service:')}
              </label>
              {!editData.edit ? (
                <select
                  className="tw-form-input tw-px-3 tw-py-1"
                  id="selectService"
                  name="selectService"
                  value={selectService}
                  onChange={handleValidation}>
                  <option value="">Select Service</option>
                  {serviceType.map((service, index) => (
                    <option key={index} value={service.toUpperCase()}>
                      {service}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  disabled
                  className="tw-form-input tw-px-3 tw-py-1 tw-cursor-not-allowed"
                  id="selectService"
                  name="selectService"
                  value={selectService}
                />
              )}
              {showErrorMsg.selectService &&
                errorMsg('Select service is required')}
            </div>
            <div className="tw-mt-4">
              <label className="tw-block tw-form-label" htmlFor="name">
                {requiredField('Service Name:')}
              </label>
              {!editData.edit ? (
                <input
                  className="tw-form-input tw-px-3 tw-py-1"
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={handleValidation}
                />
              ) : (
                <input
                  disabled
                  className="tw-form-input tw-px-3 tw-py-1 tw-cursor-not-allowed"
                  id="name"
                  name="name"
                  value={name}
                />
              )}
              {showErrorMsg.name && errorMsg('Service name is required.')}
              {sameNameError && errorMsg('Service name already exist.')}
            </div>
            <div className="tw-mt-4 tw-grid tw-grid-cols-3 tw-gap-2 ">
              <div className="tw-col-span-2">
                <label className="tw-block tw-form-label" htmlFor="url">
                  {requiredField('Connection Url:')}
                </label>
                <input
                  className="tw-form-input tw-px-3 tw-py-1"
                  id="url"
                  name="url"
                  type="text"
                  value={url}
                  onChange={handleValidation}
                />
                {showErrorMsg.url && errorMsg('Connection url is required')}
              </div>
              <div>
                <label className="tw-block tw-form-label" htmlFor="port">
                  {requiredField('Connection Port:')}
                </label>
                <input
                  className="tw-form-input tw-px-3 tw-py-1"
                  id="port"
                  name="port"
                  type="number"
                  value={port}
                  onChange={handleValidation}
                />
                {showErrorMsg.port && errorMsg('Port is required')}
              </div>
            </div>
            <div className="tw-mt-4 tw-grid tw-grid-cols-2 tw-gap-2 ">
              <div>
                <label className="tw-block tw-form-label" htmlFor="userName">
                  {requiredField('Username:')}
                </label>
                <input
                  className="tw-form-input tw-px-3 tw-py-1"
                  id="userName"
                  name="userName"
                  type="text"
                  value={userName}
                  onChange={handleValidation}
                />
                {showErrorMsg.userName && errorMsg('Username is required')}
              </div>
              <div>
                <label className="tw-block tw-form-label" htmlFor="password">
                  {requiredField('Password:')}
                </label>
                <input
                  className="tw-form-input tw-px-3 tw-py-1"
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={handleValidation}
                />
                {showErrorMsg.password && errorMsg('Password is required')}
              </div>
            </div>
            <div className="tw-mt-4">
              <label className="tw-block tw-form-label" htmlFor="database">
                Database:
              </label>
              <input
                className="tw-form-input tw-px-3 tw-py-1"
                id="database"
                name="database"
                type="text"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
              />
            </div>
            <div className="tw-mt-4">
              <label className="tw-block tw-form-label" htmlFor="driverClass">
                {requiredField('Driver Class:')}
              </label>
              {!editData.edit ? (
                <select
                  className="tw-form-input tw-px-3 tw-py-1"
                  id="driverClass"
                  name="driverClass"
                  value={driverClass}
                  onChange={handleValidation}>
                  <option value="jdbc">jdbc</option>
                </select>
              ) : (
                <input
                  disabled
                  className="tw-form-input tw-px-3 tw-py-1 tw-cursor-not-allowed"
                  id="driverClass"
                  name="driverClass"
                  value={driverClass}
                />
              )}
              {showErrorMsg.driverClass && errorMsg('Driver class is required')}
            </div>
            <div className="tw-mt-4">
              <label className="tw-block tw-form-label" htmlFor="description">
                Description:
              </label>
              <textarea
                className="tw-form-input tw-px-3 tw-py-1 "
                id="description"
                name="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {/* <div className="tw-mt-4">
              <label className="tw-block tw-form-label" htmlFor="tags">
                Tags:
              </label>
              <select
                className="tw-form-input tw-px-3 tw-py-1 "
                name="tags"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}>
                <option value="">Select Tags</option>
                <option value="volvo">Volvo</option>
                <option value="saab">Saab</option>
                <option value="opel">Opel</option>
                <option value="audi">Audi</option>
              </select>
            </div> */}
            <div className="tw-mt-4 tw-flex tw-items-center">
              <label className="tw-form-label tw-mb-0">Enable Ingestion</label>
              <div
                className={`tw-w-9 tw-cursor-pointer tw-h-5 tw-flex tw-items-center tw-rounded-full tw-mx-2 tw-px-1 tw-transition tw-duration-500 tw-ease-in-out ${
                  ingestion ? 'tw-bg-blue-700' : 'tw-bg-gray-100 tw-border-2'
                }`}
                onClick={() => setIngestion(!ingestion)}>
                <div
                  className={`tw-bg-white tw-w-3 tw-h-3 tw-rounded-full tw-shadow-md tw-transform tw-transition tw-duration-500 tw-ease-in-out ${
                    ingestion && 'tw-translate-x-4'
                  }`}
                />
              </div>
            </div>
            {ingestion && (
              <div className="tw-grid tw-grid-cols-3 tw-gap-2 tw-gap-y-0 tw-mt-4">
                <div className="tw-col-span-3">
                  <label className="tw-block tw-form-label" htmlFor="frequency">
                    Frequency:
                  </label>
                </div>
                <div className="tw-flex tw-items-center ">
                  <label
                    className="tw-form-label tw-text-xs flex-auto tw-mr-2"
                    htmlFor="frequency">
                    Day:
                  </label>
                  <select
                    className="tw-form-input tw-px-3 tw-py-1 flex-auto"
                    id="frequency"
                    name="day"
                    value={frequency.day}
                    onChange={handleChangeFrequency}>
                    {generateOptions(365, 1)}
                  </select>
                </div>
                <div className="tw-flex tw-items-center">
                  <label
                    className="tw-form-label tw-text-xs tw-mx-2"
                    htmlFor="frequency">
                    Hour:
                  </label>
                  <select
                    className="tw-form-input tw-px-3 tw-py-1"
                    id="hour"
                    name="hour"
                    value={frequency.hour}
                    onChange={handleChangeFrequency}>
                    {generateOptions(24)}
                  </select>
                </div>
                <div className="tw-flex tw-items-center">
                  <label
                    className="tw-form-label tw-text-xs tw-mx-2"
                    htmlFor="frequency">
                    Minute:
                  </label>
                  <select
                    className="tw-form-input tw-px-3 tw-py-1 "
                    id="minute"
                    name="minute"
                    value={frequency.minute}
                    onChange={handleChangeFrequency}>
                    {generateOptions(60)}
                  </select>
                </div>
              </div>
            )}
          </form>
        </div>
        <div className="tw-modal-footer tw-justify-end">
          <Button
            className="tw-mr-2 tw-text-blue-600 hover:tw-text-blue-600"
            size="regular"
            variant="text"
            onClick={onCancel}>
            Discard
          </Button>
          <Button
            size="regular"
            theme="primary"
            type="submit"
            variant="contained"
            onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </dialog>
  );
};