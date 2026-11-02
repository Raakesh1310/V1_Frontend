import { merchantApprovalModel } from "@modules/approvals/models"

export interface MerchantAuthorizerAuditInterface {
    merchant: MerchantAuhtorizerAuditDetailsInterface
};

export interface MerchantAuhtorizerAuditDetailsInterface {
    authorizers: merchantApprovalModel[];
    minApprovalsNeeded: number;
    isApproved: boolean;
    level: number;
    isRejected: boolean;
}
