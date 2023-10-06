import queryString from 'query-string';
import { OrderInterface, OrderGetQueryInterface } from 'interfaces/order';
import { GetQueryInterface, PaginatedInterface } from '../../interfaces';
import { convertQueryToPrismaUtil, getOrderByOptions } from 'lib/utils';
import { fetcher } from 'lib/api-fetcher';

export const getOrders = async (query: OrderGetQueryInterface = {}): Promise<PaginatedInterface<OrderInterface>> => {
  const { offset: skip, limit: take, order, ...restQuery } = query;
  const pagination = {
    skip,
    take,
  };
  const params = convertQueryToPrismaUtil(restQuery, 'order');
  const [response, count] = await Promise.all([
    fetcher(
      '/api/model/order/findMany',
      {},
      {
        ...params,
        ...pagination,
        ...(order && {
          orderBy: getOrderByOptions(order),
        }),
      },
    ),
    fetcher('/api/model/order/count', {}, { where: params.where }),
  ]);
  return {
    ...response,
    totalCount: count.data,
  };
};

export const createOrder = async (order: OrderInterface) => {
  return fetcher('/api/model/order', { method: 'POST', body: JSON.stringify({ data: order }) });
};

export const updateOrderById = async (id: string, order: OrderInterface) => {
  return fetcher('/api/model/order/update', {
    method: 'PUT',
    body: JSON.stringify({
      where: {
        id,
      },
      data: order,
    }),
  });
};

export const getOrderById = async (id: string, query: GetQueryInterface = {}) => {
  const { relations = [] } = query;
  const response = await fetcher(
    '/api/model/order/findFirst',
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

export const deleteOrderById = async (id: string) => {
  return fetcher(
    '/api/model/order/delete',
    { method: 'DELETE' },
    {
      where: {
        id,
      },
    },
  );
};
