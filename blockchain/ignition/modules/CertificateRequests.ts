import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CertificateRequestsModule", (m) => {
  const certificateRequests = m.contract("CertificateRequests");

  return { certificateRequests }; 
});