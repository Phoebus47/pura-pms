export const reservationStayInclude = {
  stays: {
    include: {
      room: true,
      roomType: true,
    },
    orderBy: { sequence: 'asc' as const },
  },
};

export const reservationListInclude = {
  room: {
    include: {
      roomType: true,
      property: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  guest: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  },
  folios: {
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  },
  ...reservationStayInclude,
};

export const reservationDetailInclude = {
  room: {
    include: {
      roomType: true,
      property: true,
    },
  },
  guest: true,
  folios: {
    include: {
      transactions: {
        orderBy: {
          postedAt: 'desc' as const,
        },
      },
    },
  },
  ...reservationStayInclude,
};

export const reservationMutationInclude = {
  room: {
    include: {
      roomType: true,
    },
  },
  guest: true,
  ...reservationStayInclude,
};
