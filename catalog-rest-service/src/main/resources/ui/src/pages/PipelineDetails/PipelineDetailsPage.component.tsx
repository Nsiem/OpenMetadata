import { AxiosResponse } from 'axios';
import { compare, Operation } from 'fast-json-patch';
import { observer } from 'mobx-react';
import { EntityTags, TableDetail } from 'Models';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppState from '../../AppState';
import { getLineageByFQN } from '../../axiosAPIs/lineageAPI';
import {
  addFollower,
  getPipelineByFqn,
  patchPipelineDetails,
  removeFollower,
} from '../../axiosAPIs/pipelineAPI';
import { getServiceById } from '../../axiosAPIs/serviceAPI';
import { TitleBreadcrumbProps } from '../../components/common/title-breadcrumb/title-breadcrumb.interface';
import Loader from '../../components/Loader/Loader';
import PipelineDetails from '../../components/PipelineDetails/PipelineDetails.component';
import { getServiceDetailsPath } from '../../constants/constants';
import { EntityType } from '../../enums/entity.enum';
import { Pipeline, Task } from '../../generated/entity/data/pipeline';
import { User } from '../../generated/entity/teams/user';
import { EntityLineage } from '../../generated/type/entityLineage';
import { addToRecentViewed, getCurrentUserId } from '../../utils/CommonUtils';
import { serviceTypeLogo } from '../../utils/ServiceUtils';
import {
  getOwnerFromId,
  getTagsWithoutTier,
  getTierFromTableTags,
} from '../../utils/TableUtils';
import { getTagCategories, getTaglist } from '../../utils/TagsUtils';

const PipelineDetailsPage = () => {
  const USERId = getCurrentUserId();

  const [tagList, setTagList] = useState<Array<string>>([]);
  const { pipelineFQN } = useParams() as Record<string, string>;
  const [pipelineDetails, setPipelineDetails] = useState<Pipeline>(
    {} as Pipeline
  );
  const [pipelineId, setPipelineId] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [followers, setFollowers] = useState<Array<User>>([]);
  const [owner, setOwner] = useState<TableDetail['owner']>();
  const [tier, setTier] = useState<string>();
  const [tags, setTags] = useState<Array<EntityTags>>([]);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pipelineUrl, setPipelineUrl] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');
  const [slashedPipelineName, setSlashedPipelineName] = useState<
    TitleBreadcrumbProps['titleLinks']
  >([]);

  const [entityLineage, setEntityLineage] = useState<EntityLineage>(
    {} as EntityLineage
  );
  const activeTabHandler = (tabValue: number) => {
    setActiveTab(tabValue);
  };

  const saveUpdatedPipelineData = (
    updatedData: Pipeline
  ): Promise<AxiosResponse> => {
    const jsonPatch = compare(pipelineDetails, updatedData);

    return patchPipelineDetails(
      pipelineId,
      jsonPatch
    ) as unknown as Promise<AxiosResponse>;
  };

  const fetchTags = () => {
    getTagCategories().then((res) => {
      if (res.data) {
        setTagList(getTaglist(res.data));
      }
    });
  };

  const fetchPipelineDetail = (pipelineFQN: string) => {
    setLoading(true);
    getPipelineByFqn(pipelineFQN, [
      'owner',
      'service',
      'followers',
      'tags',
      'tasks',
    ]).then((res: AxiosResponse) => {
      const {
        id,
        description,
        followers,
        fullyQualifiedName,
        service,
        tags,
        owner,
        displayName,
        tasks,
        pipelineUrl,
      } = res.data;
      setDisplayName(displayName);
      setPipelineDetails(res.data);
      setPipelineId(id);
      setDescription(description ?? '');
      setFollowers(followers);
      setOwner(getOwnerFromId(owner?.id));
      setTier(getTierFromTableTags(tags));
      setTags(getTagsWithoutTier(tags));
      getServiceById('pipelineServices', service?.id).then(
        (serviceRes: AxiosResponse) => {
          setServiceType(serviceRes.data.serviceType);
          setSlashedPipelineName([
            {
              name: serviceRes.data.name,
              url: serviceRes.data.name
                ? getServiceDetailsPath(
                    serviceRes.data.name,
                    serviceRes.data.serviceType
                  )
                : '',
              imgSrc: serviceRes.data.serviceType
                ? serviceTypeLogo(serviceRes.data.serviceType)
                : undefined,
            },
            {
              name: displayName,
              url: '',
              activeTitle: true,
            },
          ]);

          addToRecentViewed({
            entityType: EntityType.PIPELINE,
            fqn: fullyQualifiedName,
            serviceType: serviceRes.data.serviceType,
            timestamp: 0,
          });
        }
      );
      setPipelineUrl(pipelineUrl);
      setTasks(tasks);
      setLoading(false);
    });
  };

  const followPipeline = () => {
    addFollower(pipelineId, USERId).then((res: AxiosResponse) => {
      const { followers } = res.data;
      setFollowers(followers);
    });
  };
  const unfollowPipeline = () => {
    removeFollower(pipelineId, USERId).then((res: AxiosResponse) => {
      const { followers } = res.data;

      setFollowers(followers);
    });
  };

  const descriptionUpdateHandler = (updatedPipeline: Pipeline) => {
    saveUpdatedPipelineData(updatedPipeline).then((res: AxiosResponse) => {
      const { description } = res.data;
      setPipelineDetails(res.data);
      setDescription(description);
    });
  };

  const settingsUpdateHandler = (updatedPipeline: Pipeline): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      saveUpdatedPipelineData(updatedPipeline)
        .then((res) => {
          setPipelineDetails(res.data);
          setOwner(getOwnerFromId(res.data.owner?.id));
          setTier(getTierFromTableTags(res.data.tags));
          resolve();
        })
        .catch(() => reject());
    });
  };

  const onTagUpdate = (updatedPipeline: Pipeline) => {
    saveUpdatedPipelineData(updatedPipeline).then((res: AxiosResponse) => {
      setTier(getTierFromTableTags(res.data.tags));
      setTags(getTagsWithoutTier(res.data.tags));
    });
  };

  const onTaskUpdate = (jsonPatch: Array<Operation>) => {
    patchPipelineDetails(pipelineId, jsonPatch).then((res: AxiosResponse) => {
      setTasks(res.data.tasks || []);
    });
  };

  useEffect(() => {
    fetchPipelineDetail(pipelineFQN);
    setActiveTab(1);
    getLineageByFQN(pipelineFQN, EntityType.PIPELINE).then(
      (res: AxiosResponse) => setEntityLineage(res.data)
    );
  }, [pipelineFQN]);

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <PipelineDetails
          activeTab={activeTab}
          description={description}
          descriptionUpdateHandler={descriptionUpdateHandler}
          entityLineage={entityLineage}
          entityName={displayName}
          followers={followers}
          followPipelineHandler={followPipeline}
          owner={owner}
          pipelineDetails={pipelineDetails}
          pipelineTags={tags}
          pipelineUrl={pipelineUrl}
          serviceType={serviceType}
          setActiveTabHandler={activeTabHandler}
          settingsUpdateHandler={settingsUpdateHandler}
          slashedPipelineName={slashedPipelineName}
          tagList={tagList}
          tagUpdateHandler={onTagUpdate}
          tasks={tasks}
          taskUpdateHandler={onTaskUpdate}
          tier={tier as string}
          unfollowPipelineHandler={unfollowPipeline}
          users={AppState.users}
        />
      )}
    </>
  );
};

export default observer(PipelineDetailsPage);