import * as _prisma_client_extension_js from '@prisma/client/extension.js';
import { PrismaClient as PrismaClient$1 } from '@prisma/client/extension.js';
import * as _prisma_client_runtime_library from '@prisma/client/runtime/library';
import { PrismaClient } from '@prisma/client/extension';

type ConfigureReplicaCallback = (client: PrismaClient) => PrismaClient;

type ReplicasOptions = {
    url: string | string[];
    replicas?: undefined;
} | {
    url?: undefined;
    replicas: PrismaClient$1[];
};
declare const readReplicas: (options: ReplicasOptions, configureReplicaClient?: ConfigureReplicaCallback) => (client: any) => _prisma_client_extension_js.PrismaClientExtends<_prisma_client_runtime_library.InternalArgs<{}, {}, {}, {
    $primary<T extends object>(this: T): Omit<T, "$primary" | "$replica">;
    $replica<T extends object>(this: T): Omit<T, "$primary" | "$replica">;
    $listen(event: string, listener: (...args: any[]) => void): void;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
}> & _prisma_client_runtime_library.DefaultArgs>;

export { readReplicas };
