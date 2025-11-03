
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

export type Submission = {
    id: string;
    candidateId: string;
    problemId: string;
    codeHTML: string;
    codeCSS: string;
    codeJS: string;
    submissionTime: any;
};
    
export type Candidate = {
    id: string;
    name: string;
    email: string;
    status: 'Invited' | 'In Progress' | 'Completed' | 'Pending';
    problemId: string;
    positionId: string;
    departmentId: string;
    scheduledTime: any;
    accessCode: string;
    submissionId: string | null;
    remarks: any[];
    submitTime: any | null;
}
