import * as _prisma_client_extension from '@prisma/client/extension';
import { PrismaClient } from '@prisma/client/extension';
import * as _prisma_client_runtime_library from '@prisma/client/runtime/library';
import { PrismaClient as PrismaClient$1 } from '@prisma/client/extension.js';

type ConfigureReplicaCallback = (client: PrismaClient) => PrismaClient;

type ReplicasOptions = {
    url: string | string[];
    replicas?: undefined;
} | {
    url?: undefined;
    replicas: PrismaClient$1[];
};
declare const readReplicas: (options: ReplicasOptions, configureReplicaClient?: ConfigureReplicaCallback) => (client: any) => _prisma_client_extension.PrismaClientExtends<_prisma_client_runtime_library.InternalArgs<{}, {}, {}, {
    $primary<T extends object>(this: T): Omit<T, "$primary" | "$replica">;
    $replica<T_1 extends object>(this: T_1): Omit<T_1, "$primary" | "$replica">;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
}> & _prisma_client_runtime_library.DefaultArgs>;

export { readReplicas };
