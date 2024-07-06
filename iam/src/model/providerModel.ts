import IAM from "./iamModel";
import ProviderSchema from "../schema/providerSchema";
import ProviderInterface from "../interface/providerInterface";

const Provider = IAM.discriminator<ProviderInterface>(
  "Provider",
  ProviderSchema
);

export default Provider;
