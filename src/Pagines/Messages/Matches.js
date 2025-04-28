import React from "react";
import { Layout, Card, List, Button, Typography, Spin } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import MatchCard from "../../Components/Matches/MatchCard";
import EmptyState from "../../Components/UI/EmptyState";
import { useMatches } from "../../Hooks/useMatches";
import "./Matches.css";

const { Title } = Typography;
const { Content } = Layout;

const Matches = () => {
  const navigate = useNavigate();
  const { matches, loading, refreshMatches } = useMatches();

  const handleMatchPress = (matchedUser) => {
    navigate(`/chat/${matchedUser.matchId}`, {
      state: { user: matchedUser }
    });
  };

  return (
    <Layout className="matches-layout">
      <Content className="matches-content">
        <Card className="matches-card">
          <div className="matches-header">
            <Title level={2}>Els teus 'matches'</Title>
            <Button 
              icon={<ReloadOutlined />}
              onClick={refreshMatches}
            />
          </div>

          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <List
              className="matches-list"
              dataSource={matches}
              renderItem={(item) => (
                <MatchCard item={item} onPress={handleMatchPress} />
              )}
              locale={{
                emptyText: (
                  <EmptyState
                    iconName="heart"
                    title="Encara no tens cap 'match'"
                    subtitle="Segueix explorant per connectar amb més persones"
                  />
                )
              }}
            />
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default Matches;
