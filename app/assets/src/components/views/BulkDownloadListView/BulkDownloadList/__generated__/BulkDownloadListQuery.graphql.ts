/**
 * @generated SignedSource<<51f29686e32d5efd93ac5d41ed35982d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BulkDownloadListQuery$variables = Record<PropertyKey, never>;
export type BulkDownloadListQuery$data = {
  readonly fedBulkDownloads: ReadonlyArray<{
    readonly analysisCount: number | null | undefined;
    readonly downloadType: string | null | undefined;
    readonly entityInputFileType: string | null | undefined;
    readonly entityInputs: ReadonlyArray<{
      readonly id: string | null | undefined;
    } | null | undefined> | null | undefined;
    readonly fileSize: number | null | undefined;
    readonly id: string | null | undefined;
    readonly ownerUserId: number | null | undefined;
    readonly startedAt: string | null | undefined;
    readonly status: string | null | undefined;
    readonly url: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"AdvancedDownloadTabFragment" | "BulkDownloadDetailsModeFragment" | "DetailsTabFragment">;
  } | null | undefined> | null | undefined;
};
export type BulkDownloadListQuery = {
  response: BulkDownloadListQuery$data;
  variables: BulkDownloadListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startedAt",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ownerUserId",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "downloadType",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "analysisCount",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "fileSize",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityInputFileType",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "BulkDownloadListQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "query_fedBulkDownloads_items",
        "kind": "LinkedField",
        "name": "fedBulkDownloads",
        "plural": true,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "BulkDownloadDetailsModeFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "DetailsTabFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "AdvancedDownloadTabFragment"
          },
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "query_fedBulkDownloads_items_entityInputs_items",
            "kind": "LinkedField",
            "name": "entityInputs",
            "plural": true,
            "selections": [
              (v0/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "BulkDownloadListQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "query_fedBulkDownloads_items",
        "kind": "LinkedField",
        "name": "fedBulkDownloads",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "logUrl",
            "storageKey": null
          },
          (v1/*: any*/),
          (v7/*: any*/),
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "errorMessage",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "query_fedBulkDownloads_items_params_items",
            "kind": "LinkedField",
            "name": "params",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "paramType",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "value",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "displayName",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "query_fedBulkDownloads_items_entityInputs_items",
            "kind": "LinkedField",
            "name": "entityInputs",
            "plural": true,
            "selections": [
              (v0/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v2/*: any*/),
          (v3/*: any*/),
          (v5/*: any*/),
          (v8/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "452c6753d0936f6c02eb34e46874c424",
    "id": null,
    "metadata": {},
    "name": "BulkDownloadListQuery",
    "operationKind": "query",
    "text": "query BulkDownloadListQuery {\n  fedBulkDownloads {\n    ...BulkDownloadDetailsModeFragment\n    ...DetailsTabFragment\n    ...AdvancedDownloadTabFragment\n    id\n    status\n    startedAt\n    ownerUserId\n    downloadType\n    analysisCount\n    url\n    fileSize\n    entityInputFileType\n    entityInputs {\n      id\n    }\n  }\n}\n\nfragment AdvancedDownloadTabFragment on query_fedBulkDownloads_items {\n  id\n  url\n  status\n  fileSize\n  downloadType\n  params {\n    paramType\n    value\n    displayName\n  }\n}\n\nfragment BulkDownloadDetailsModeFragment on query_fedBulkDownloads_items {\n  id\n  url\n  logUrl\n  status\n  fileSize\n  downloadType\n  errorMessage\n  params {\n    paramType\n    value\n    displayName\n  }\n}\n\nfragment DetailsTabFragment on query_fedBulkDownloads_items {\n  id\n  downloadType\n  params {\n    paramType\n    value\n    displayName\n  }\n  entityInputs {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "a26e15399d86967f593452d6effd6ed0";

export default node;
