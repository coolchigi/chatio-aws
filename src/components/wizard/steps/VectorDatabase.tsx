import React, { useState, useEffect } from "react";
import {
  Heading,
  Text,
  Flex,
  Button,
  View,
  useTheme,
  Alert,
  Card,
  Badge,
  Radio,
  RadioGroupField,
  Accordion,
  Link,
  Grid,
  Icon,
  SliderField,
  SwitchField,
  SelectField
} from "@aws-amplify/ui-react";
import { vectorDatabaseOptions } from '../../../config/aws-config';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import {
  setVectorDb,
  setStorageGB,
  setEstimatedDocuments,
  setEstimatedQueries
} from '../../../store/costSlice';
import { 
  calculateOpenSearchCost,
  calculateAuroraCost,
  calculateKendraCost,
  calculatePineconeCost
} from '../../../cost/costCalculators';

interface VectorDatabaseProps {
  config: {
    name: string;
    region: string;
    vectorDatabaseId: string;
    modelId: string;
    knowledgeBaseId: string;
    deploymentOption: string;
  };
  updateConfig: (updates: Partial<{ vectorDatabaseId: string }>) => void;
  onNext: () => void;
  onBack: () => void;
}

const VectorDatabase: React.FC<VectorDatabaseProps> = ({
  config,
  updateConfig,
  onNext,
  onBack
}) => {
  const { tokens } = useTheme();
  const dispatch = useDispatch();
  
  const selectedDb = useSelector((state: RootState) => state.cost.vectorDb);
  const storageGB = useSelector((state: RootState) => state.cost.storageGB);
  const estimatedDocuments = useSelector((state: RootState) => state.cost.estimatedDocuments);
  const estimatedQueries = useSelector((state: RootState) => state.cost.estimatedQueries);
  
  const [error, setError] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  
  // User-configurable parameters - NO DEFAULTS!
  const [userConfig, setUserConfig] = useState({
    opensearchNodes: 3,
    opensearchInstanceType: 'or1.large.search',
    opensearchServerless: false,
    auroraNodes: 2,
    auroraInstanceType: 'db.r5.large',
    kendraTier: 'developer' as 'developer' | 'enterprise',
    pineconePods: 1,
    pineconeTier: 'starter' as 'starter' | 'standard'
  });
  
  const [costs, setCosts] = useState<Record<string, { cost: number; breakdown: string; error?: string }>>({});

  // Calculate costs when parameters change
  useEffect(() => {
    const newCosts: Record<string, { cost: number; breakdown: string; error?: string }> = {};

    // OpenSearch Service
    try {
      if (userConfig.opensearchServerless) {
        const result = calculateOpenSearchCost({
          storageGB,
          nodes: 2, // Serverless minimum
          instanceType: 'serverless',
          serverless: true
        });
        newCosts.opensearch = {
          cost: result.total,
          breakdown: `Serverless: ${result.breakdown.compute} + ${result.breakdown.storage}`
        };
      } else {
        const result = calculateOpenSearchCost({
          storageGB,
          nodes: userConfig.opensearchNodes,
          instanceType: userConfig.opensearchInstanceType,
          serverless: false
        });
        newCosts.opensearch = {
          cost: result.total,
          breakdown: `${result.breakdown.compute} + ${result.breakdown.storage}`
        };
      }
    } catch (error) {
      newCosts.opensearch = {
        cost: 0,
        breakdown: 'Configuration required',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Aurora
    try {
      const estimatedIOPerMonth = estimatedQueries * 2; // Rough estimate: 2 I/O per query
      const result = calculateAuroraCost({
        storageGB,
        nodes: userConfig.auroraNodes,
        instanceType: userConfig.auroraInstanceType,
        estimatedIOPerMonth
      });
      newCosts.aurora = {
        cost: result.total,
        breakdown: `${result.breakdown.compute} + ${result.breakdown.storage}`
      };
    } catch (error) {
      newCosts.aurora = {
        cost: 0,
        breakdown: 'Configuration required',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Kendra
    try {
      const result = calculateKendraCost({
        edition: userConfig.kendraTier
      });
      newCosts.kendra = {
        cost: result.total,
        breakdown: result.breakdown.compute
      };
    } catch (error) {
      newCosts.kendra = {
        cost: 0,
        breakdown: 'Configuration required',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Pinecone
    try {
      const result = calculatePineconeCost({
        pods: userConfig.pineconePods,
        tier: userConfig.pineconeTier
      });
      newCosts.pinecone = {
        cost: result.total,
        breakdown: result.breakdown.compute
      };
    } catch (error) {
      newCosts.pinecone = {
        cost: 0,
        breakdown: 'Configuration required',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    setCosts(newCosts);
  }, [storageGB, estimatedDocuments, estimatedQueries, userConfig]);

  const handleDatabaseChange = (value: string) => {
    dispatch(setVectorDb(value));
    updateConfig({ vectorDatabaseId: value });
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDb) {
      setError("Please select a vector database");
      return;
    }
    onNext();
  };

  const selectedDatabase = vectorDatabaseOptions.find(db => db.id === selectedDb);

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap={tokens.space.large}>
        {/* Header */}
        <View textAlign="center">
          <Heading level={3} color={tokens.colors.primary[80]}>
            Select Vector Database
          </Heading>
          <Text color={tokens.colors.font.secondary} fontSize={tokens.fontSizes.medium}>
            Choose and configure your vector database
          </Text>
        </View>

        {/* Error Alert */}
        {error && (
          <Alert variation="error" isDismissible={true} hasIcon={true}>
            {error}
          </Alert>
        )}

        {/* Configuration Panel */}
        <Card variation="outlined" padding={tokens.space.large} backgroundColor={tokens.colors.blue[10]}>
          <Flex direction="column" gap={tokens.space.medium}>
            <Heading level={5}>Configure Your Usage</Heading>
            
            <Grid templateColumns="1fr 1fr" gap={tokens.space.medium}>
              <SliderField
                label={`Storage: ${storageGB} GB`}
                min={10}
                max={1000}
                step={10}
                value={storageGB}
                onChange={(value) => dispatch(setStorageGB(value))}
              />
              <SliderField
                label={`Queries/Month: ${estimatedQueries.toLocaleString()}`}
                min={1000}
                max={1000000}
                step={1000}
                value={estimatedQueries}
                onChange={(value) => dispatch(setEstimatedQueries(value))}
              />
            </Grid>

            <SwitchField
              label="Show detailed comparison"
              checked={showComparison}
              onChange={(e) => setShowComparison(e.target.checked)}
            />
          </Flex>
        </Card>

        {/* Database-specific Configuration */}
        {(selectedDb === 'opensearch' || showComparison) && (
          <Card variation="outlined" padding={tokens.space.medium}>
            <Heading level={6}>OpenSearch Configuration</Heading>
            <Grid templateColumns="1fr 1fr 1fr" gap={tokens.space.small}>
              <SliderField
                label={`Nodes: ${userConfig.opensearchNodes}`}
                min={1}
                max={10}
                value={userConfig.opensearchNodes}
                onChange={(value) => setUserConfig(prev => ({ ...prev, opensearchNodes: value }))}
              />
              <SelectField
                label="Instance Type"
                value={userConfig.opensearchInstanceType}
                onChange={(e) => setUserConfig(prev => ({ ...prev, opensearchInstanceType: e.target.value }))}
              >
                <option value="t3.small.search">t3.small ($0.036/hr)</option>
                <option value="or1.large.search">or1.large ($0.209/hr)</option>
                <option value="or1.xlarge.search">or1.xlarge ($0.418/hr)</option>
              </SelectField>
              <SwitchField
                label="Use Serverless"
                checked={userConfig.opensearchServerless}
                onChange={(e) => setUserConfig(prev => ({ ...prev, opensearchServerless: e.target.checked }))}
              />
            </Grid>
          </Card>
        )}

        {/* Database Options */}
        <RadioGroupField
          legend="Vector Database Options"
          name="vectorDatabase"
          value={selectedDb}
          onChange={(e) => handleDatabaseChange(e.target.value)}
          legendHidden={true}
        >
          <Flex direction="column" gap={tokens.space.medium}>
            {vectorDatabaseOptions.map((db) => {
              const isSelected = selectedDb === db.id;
              const costInfo = costs[db.id];
              const displayCost = costInfo ? Math.round(costInfo.cost) : 0;

              return (
                <Card
                  key={db.id}
                  variation={isSelected ? "elevated" : "outlined"}
                  padding={tokens.space.medium}
                  borderColor={isSelected ? tokens.colors.blue[60] : undefined}
                  backgroundColor={isSelected ? tokens.colors.blue[10] : undefined}
                  onClick={() => handleDatabaseChange(db.id)}
                  style={{ cursor: "pointer" }}
                >
                  <Flex direction="column" gap={tokens.space.small}>
                    <Flex alignItems="center" justifyContent="space-between">
                      <Flex alignItems="center" gap={tokens.space.small}>
                        <Radio value={db.id} name="vectorDatabase" onChange={() => {}} />
                        <Heading level={5} margin="0">{db.name}</Heading>
                        <Badge variation="info" size="small">
                          {db.setupComplexity} Setup
                        </Badge>
                      </Flex>
                      <Text fontWeight={tokens.fontWeights.semibold} color={tokens.colors.green[70]}>
                        ${displayCost}/mo
                      </Text>
                    </Flex>

                    <Text fontSize={tokens.fontSizes.small} marginLeft="1.5rem">
                      {db.description}
                    </Text>

                    {costInfo?.breakdown && (
                      <Text fontSize={tokens.fontSizes.xs} color={tokens.colors.font.secondary} marginLeft="1.5rem">
                        {costInfo.breakdown}
                      </Text>
                    )}

                    {costInfo?.error && (
                      <Text fontSize={tokens.fontSizes.xs} color={tokens.colors.red[70]} marginLeft="1.5rem">
                        Error: {costInfo.error}
                      </Text>
                    )}

                    <Link href={db.pricingDetails} isExternal={true} fontSize={tokens.fontSizes.xs} marginLeft="1.5rem">
                      View Official Pricing
                    </Link>
                  </Flex>
                </Card>
              );
            })}
          </Flex>
        </RadioGroupField>

        {/* Cost Comparison Table */}
        {showComparison && (
          <Card variation="outlined" padding={tokens.space.large}>
            <Heading level={5} marginBottom={tokens.space.medium}>Cost Comparison</Heading>
            <View style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: tokens.space.small.value }}>Database</th>
                    <th style={{ textAlign: 'right', padding: tokens.space.small.value }}>Monthly Cost</th>
                    <th style={{ textAlign: 'left', padding: tokens.space.small.value }}>Configuration</th>
                  </tr>
                </thead>
                <tbody>
                  {vectorDatabaseOptions.map((db) => {
                    const costInfo = costs[db.id];
                    return (
                      <tr key={db.id} style={{ 
                        backgroundColor: selectedDb === db.id ? tokens.colors.blue[10].value : undefined
                      }}>
                        <td style={{ padding: tokens.space.small.value }}>{db.name}</td>
                        <td style={{ textAlign: 'right', padding: tokens.space.small.value }}>
                          ${costInfo ? Math.round(costInfo.cost) : 0}
                        </td>
                        <td style={{ padding: tokens.space.small.value, fontSize: '0.8em' }}>
                          {costInfo?.breakdown || 'Not configured'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </View>
          </Card>
        )}

        {/* Selected Database Summary */}
        {selectedDatabase && costs[selectedDb] && (
          <Card backgroundColor={tokens.colors.green[10]} padding={tokens.space.large}>
            <Text fontWeight={tokens.fontWeights.semibold} color={tokens.colors.green[80]}>
              Selected: {selectedDatabase.name}
            </Text>
            <Text fontSize={tokens.fontSizes.small} color={tokens.colors.green[70]}>
              Estimated cost: <strong>${Math.round(costs[selectedDb].cost)}/month</strong>
            </Text>
            <Text fontSize={tokens.fontSizes.xs} color={tokens.colors.green[70]}>
              Based on: {costs[selectedDb].breakdown}
            </Text>
          </Card>
        )}

        {/* Navigation */}
        <Flex justifyContent="space-between">
          <Button onClick={onBack} variation="link" size="large">
            ← Back
          </Button>
          <Button type="submit" variation="primary" size="large" isDisabled={!selectedDb}>
            Continue →
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default VectorDatabase;