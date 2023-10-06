import queryString from 'query-string';
import { RestaurantInterface, RestaurantGetQueryInterface } from 'interfaces/restaurant';
import { GetQueryInterface, PaginatedInterface } from '../../interfaces';
import { convertQueryToPrismaUtil, getOrderByOptions } from 'lib/utils';
import { fetcher } from 'lib/api-fetcher';

export const getRestaurants = async (
  query: RestaurantGetQueryInterface = {},
): Promise<PaginatedInterface<RestaurantInterface>> => {
  const { offset: skip, limit: take, order, ...restQuery } = query;
  const pagination = {
    skip,
    take,
  };
  const params = convertQueryToPrismaUtil(restQuery, 'restaurant');
  const [response, count] = await Promise.all([
    fetcher(
      '/api/model/restaurant/findMany',
      {},
      {
        ...params,
        ...pagination,
        ...(order && {
          orderBy: getOrderByOptions(order),
        }),
      },
    ),
    fetcher('/api/model/restaurant/count', {}, { where: params.where }),
  ]);
  return {
    ...response,
    totalCount: count.data,
  };
};

export const createRestaurant = async (restaurant: RestaurantInterface) => {
  return fetcher('/api/model/restaurant', { method: 'POST', body: JSON.stringify({ data: restaurant }) });
};

export const updateRestaurantById = async (id: string, restaurant: RestaurantInterface) => {
  return fetcher('/api/model/restaurant/update', {
    method: 'PUT',
    body: JSON.stringify({
      where: {
        id,
      },
      data: restaurant,
    }),
  });
};

export const getRestaurantById = async (id: string, query: GetQueryInterface = {}) => {
  const { relations = [] } = query;
  const response = await fetcher(
    '/api/model/restaurant/findFirst',
    {},
    {
      where: {
        id,
      },
      include: relations.reduce((acc, el) => ({ ...acc, [el.split('.')[0]]: true }), {}),
    },
  );
  return response.data;
};

export const deleteRestaurantById = async (id: string) => {
  return fetcher(
    '/api/model/restaurant/delete',
    { method: 'DELETE' },
    {
      where: {
        id,
      },
    },
  );
};
