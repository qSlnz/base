interface Pool {
    poolId: number,
    threshold: number,
    deadline: number,
    totalStaked: number,
    executed: boolean,
    remainingTime: number,
    userBalance: number
};

export default Pool;