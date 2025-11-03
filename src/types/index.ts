
export type Technology = {
    id: string;
    name: string;
    name_lowercase: string;
    createdAt: any;
};

export type Department = {
    id: string;
    name: string;
};

export type Position = {
    id: string;
    title: string;
    departmentId: string;
}

export type Problem = {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    tags: string[];
    departmentId: string;
    positionId: string;
}
    
