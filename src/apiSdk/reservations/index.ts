import queryString from 'query-string';
import { ReservationInterface, ReservationGetQueryInterface } from 'interfaces/reservation';
import { GetQueryInterface, PaginatedInterface } from '../../interfaces';
import { convertQueryToPrismaUtil, getOrderByOptions } from 'lib/utils';
import { fetcher } from 'lib/api-fetcher';

export const getReservations = async (
  query: ReservationGetQueryInterface = {},
): Promise<PaginatedInterface<ReservationInterface>> => {
  const { offset: skip, limit: take, order, ...restQuery } = query;
  const pagination = {
    skip,
    take,
  };
  const params = convertQueryToPrismaUtil(restQuery, 'reservation');
  const [response, count] = await Promise.all([
    fetcher(
      '/api/model/reservation/findMany',
      {},
      {
        ...params,
        ...pagination,
        ...(order && {
          orderBy: getOrderByOptions(order),
        }),
      },
    ),
    fetcher('/api/model/reservation/count', {}, { where: params.where }),
  ]);
  return {
    ...response,
    totalCount: count.data,
  };
};

export const createReservation = async (reservation: ReservationInterface) => {
  return fetcher('/api/model/reservation', { method: 'POST', body: JSON.stringify({ data: reservation }) });
};

export const updateReservationById = async (id: string, reservation: ReservationInterface) => {
  return fetcher('/api/model/reservation/update', {
    method: 'PUT',
    body: JSON.stringify({
      where: {
        id,
      },
      data: reservation,
    }),
  });
};

export const getReservationById = async (id: string, query: GetQueryInterface = {}) => {
  const { relations = [] } = query;
  const response = await fetcher(
    '/api/model/reservation/findFirst',
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

export const deleteReservationById = async (id: string) => {
  return fetcher(
    '/api/model/reservation/delete',
    { method: 'DELETE' },
    {
      where: {
        id,
      },
    },
  );
};
