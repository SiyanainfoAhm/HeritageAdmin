import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';

interface DashboardProps {
  onLogout?: () => void;
  onPageChange?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, onPageChange }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [selectedMainTab, setSelectedMainTab] = useState('application');
  const [selectedDateFilter, setSelectedDateFilter] = useState('month');

  // Chart refs
  const channelChartRef = useRef<HTMLDivElement>(null);
  const downloadGrowthChartRef = useRef<HTMLDivElement>(null);
  const userGrowthChartRef = useRef<HTMLDivElement>(null);
  const signupTypeChartRef = useRef<HTMLDivElement>(null);
  const timeOnSiteChartRef = useRef<HTMLDivElement>(null);
  const topCitiesChartRef = useRef<HTMLDivElement>(null);
  const deviceTypeChartRef = useRef<HTMLDivElement>(null);
  const userTypeChartRef = useRef<HTMLDivElement>(null);
  const revenueCategoryChartRef = useRef<HTMLDivElement>(null);
  const revenueTimeChartRef = useRef<HTMLDivElement>(null);
  const engagementChartRef = useRef<HTMLDivElement>(null);
  const socialGrowthChartRef = useRef<HTMLDivElement>(null);
  const visitorOriginChartRef = useRef<HTMLDivElement>(null);
  const ageGroupChartRef = useRef<HTMLDivElement>(null);
  const travelPurposeChartRef = useRef<HTMLDivElement>(null);
  const monthlyInfluxChartRef = useRef<HTMLDivElement>(null);
  const crowdTrendChartRef = useRef<HTMLDivElement>(null);
  const timeSlotChartRef = useRef<HTMLDivElement>(null);
  const heritageHealthChartRef = useRef<HTMLDivElement>(null);
  const conservationStatusChartRef = useRef<HTMLDivElement>(null);
  const visitorBehaviorChartRef = useRef<HTMLDivElement>(null);
  const satisfactionChartRef = useRef<HTMLDivElement>(null);
  const interestRadarChartRef = useRef<HTMLDivElement>(null);
  const deviceUsageChartRef = useRef<HTMLDivElement>(null);
  const conversionChartRef = useRef<HTMLDivElement>(null);
  const wishlistChartRef = useRef<HTMLDivElement>(null);
  const timeSpentChartRef = useRef<HTMLDivElement>(null);
  const sentimentChartRef = useRef<HTMLDivElement>(null);

  const mainTabs = [
    'application',
    'website',
    'revenue',
    'social',
    'tourism',
    'crowd',
    'heritage',
    'behavior'
  ];

  const dateFilters = [
    'today',
    'week',
    'month',
    'quarter',
    'year',
    'custom'
  ];

  // Initialize charts when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).echarts) {
      initializeCharts();
    }
  }, [selectedMainTab, selectedDateFilter]);

  const initializeCharts = () => {
    const echarts = (window as any).echarts;
    if (!echarts) return;

    const chartColors = [
      "rgba(87, 181, 231, 1)",
      "rgba(141, 211, 199, 1)",
      "rgba(251, 191, 114, 1)",
      "rgba(252, 141, 98, 1)",
    ];

    // Channel Chart
    if (channelChartRef.current) {
      const channelChart = echarts.init(channelChartRef.current);
      const channelOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false } },
        yAxis: {
          type: 'category',
          data: ['App Store', 'Google Play', 'Direct', 'Social Media'],
          axisLine: { show: false },
          axisTick: { show: false }
        },
        series: [{
          type: 'bar',
          data: [145, 189, 87, 123],
          itemStyle: { color: 'rgba(87, 181, 231, 1)', borderRadius: [0, 4, 4, 0] }
        }]
      };
      channelChart.setOption(channelOption);
    }

    // Download Growth Chart
    if (downloadGrowthChartRef.current) {
      const downloadGrowthChart = echarts.init(downloadGrowthChartRef.current);
      const downloadGrowthOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 40 },
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          axisLine: { show: false },
          axisTick: { show: false }
        },
        yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false } },
        series: [{
          type: 'line',
          data: [120, 132, 101, 134, 190, 230],
          smooth: true,
          symbol: 'none',
          lineStyle: { color: 'rgba(87, 181, 231, 1)', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(87, 181, 231, 0.2)' },
                { offset: 1, color: 'rgba(87, 181, 231, 0.05)' }
              ]
            }
          }
        }]
      };
      downloadGrowthChart.setOption(downloadGrowthOption);
    }

    // User Growth Chart
    if (userGrowthChartRef.current) {
      const userGrowthChart = echarts.init(userGrowthChartRef.current);
      const userGrowthOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 40 },
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          axisLine: { show: false },
          axisTick: { show: false }
        },
        yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false } },
        series: [{
          type: 'line',
          data: [65, 78, 89, 95, 102, 115],
          smooth: true,
          symbol: 'none',
          lineStyle: { color: 'rgba(141, 211, 199, 1)', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(141, 211, 199, 0.2)' },
                { offset: 1, color: 'rgba(141, 211, 199, 0.05)' }
              ]
            }
          }
        }]
      };
      userGrowthChart.setOption(userGrowthOption);
    }

    // Signup Type Chart
    if (signupTypeChartRef.current) {
      const signupTypeChart = echarts.init(signupTypeChartRef.current);
      const signupTypeOption = {
        animation: false,
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: 45, name: 'Tourist', itemStyle: { color: 'rgba(87, 181, 231, 1)' } },
            { value: 25, name: 'Vendor', itemStyle: { color: 'rgba(141, 211, 199, 1)' } },
            { value: 20, name: 'Guide', itemStyle: { color: 'rgba(251, 191, 114, 1)' } },
            { value: 10, name: 'Admin', itemStyle: { color: 'rgba(252, 141, 98, 1)' } }
          ],
          itemStyle: { borderRadius: 4 },
          label: { show: true, position: 'outside' }
        }]
      };
      signupTypeChart.setOption(signupTypeOption);
    }

    // Time on Site Chart
    if (timeOnSiteChartRef.current) {
      const timeOnSiteChart = echarts.init(timeOnSiteChartRef.current);
      const timeOnSiteOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisLine: { show: false },
          axisTick: { show: false }
        },
        yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false } },
        series: [{
          type: 'bar',
          data: [4.2, 3.8, 4.5, 4.1, 3.9, 5.2, 4.8],
          itemStyle: { color: 'rgba(87, 181, 231, 1)', borderRadius: [4, 4, 0, 0] }
        }]
      };
      timeOnSiteChart.setOption(timeOnSiteOption);
    }

    // Top Cities Chart
    if (topCitiesChartRef.current) {
      const topCitiesChart = echarts.init(topCitiesChartRef.current);
      const topCitiesOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false } },
        yAxis: {
          type: 'category',
          data: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai'],
          axisLine: { show: false },
          axisTick: { show: false }
        },
        series: [{
          type: 'bar',
          data: [234, 189, 156, 134],
          itemStyle: { color: 'rgba(141, 211, 199, 1)', borderRadius: [0, 4, 4, 0] }
        }]
      };
      topCitiesChart.setOption(topCitiesOption);
    }

    // Device Type Chart
    if (deviceTypeChartRef.current) {
      const deviceTypeChart = echarts.init(deviceTypeChartRef.current);
      const deviceTypeOption = {
        animation: false,
        series: [{
          type: 'pie',
          radius: '60%',
          data: [
            { value: 55, name: 'Mobile', itemStyle: { color: 'rgba(87, 181, 231, 1)' } },
            { value: 30, name: 'Desktop', itemStyle: { color: 'rgba(141, 211, 199, 1)' } },
            { value: 15, name: 'Tablet', itemStyle: { color: 'rgba(251, 191, 114, 1)' } }
          ],
          itemStyle: { borderRadius: 4 }
        }]
      };
      deviceTypeChart.setOption(deviceTypeOption);
    }

    // User Type Chart
    if (userTypeChartRef.current) {
      const userTypeChart = echarts.init(userTypeChartRef.current);
      const userTypeOption = {
        animation: false,
        series: [{
          type: 'pie',
          radius: '60%',
          data: [
            { value: 65, name: 'New Users', itemStyle: { color: 'rgba(87, 181, 231, 1)' } },
            { value: 35, name: 'Returning', itemStyle: { color: 'rgba(141, 211, 199, 1)' } }
          ],
          itemStyle: { borderRadius: 4 }
        }]
      };
      userTypeChart.setOption(userTypeOption);
    }

    // Revenue Category Chart
    if (revenueCategoryChartRef.current) {
      const revenueCategoryChart = echarts.init(revenueCategoryChartRef.current);
      const revenueCategoryOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: {
          type: 'category',
          data: ['Tickets', 'Tours', 'Merchandise', 'Events'],
          axisLine: { show: false },
          axisTick: { show: false }
        },
        yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false } },
        series: [{
          type: 'bar',
          data: [2400, 1800, 600, 450],
          itemStyle: { color: 'rgba(87, 181, 231, 1)', borderRadius: [4, 4, 0, 0] }
        }]
      };
      revenueCategoryChart.setOption(revenueCategoryOption);
    }

    // Revenue Time Chart
    if (revenueTimeChartRef.current) {
      const revenueTimeChart = echarts.init(revenueTimeChartRef.current);
      const revenueTimeOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          axisLine: { show: false },
          axisTick: { show: false }
        },
        yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false } },
        series: [{
          type: 'line',
          data: [420, 480, 520, 580, 650, 720],
          smooth: true,
          symbol: 'none',
          lineStyle: { color: 'rgba(87, 181, 231, 1)', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(87, 181, 231, 0.2)' },
                { offset: 1, color: 'rgba(87, 181, 231, 0.05)' }
              ]
            }
          }
        }]
      };
      revenueTimeChart.setOption(revenueTimeOption);
    }

    // Engagement Chart
    if (engagementChartRef.current) {
      const engagementChart = echarts.init(engagementChartRef.current);
      const engagementOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisLine: { show: false },
          axisTick: { show: false }
        },
        yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false } },
        series: [
          {
            type: 'line',
            data: [850, 900, 920, 950, 1350, 1400, 1380],
            smooth: true,
            symbol: 'none',
            lineStyle: { color: 'rgba(87, 181, 231, 1)', width: 3 },
            name: 'Primary Engagement'
          },
          {
            type: 'line',
            data: [250, 280, 320, 350, 380, 400, 420],
            smooth: true,
            symbol: 'none',
            lineStyle: { color: 'rgba(141, 211, 199, 1)', width: 3 },
            name: 'Secondary Engagement'
          }
        ]
      };
      engagementChart.setOption(engagementOption);
    }

    // Social Growth Chart
    if (socialGrowthChartRef.current) {
      const socialGrowthChart = echarts.init(socialGrowthChartRef.current);
      const socialGrowthOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: {
          type: 'category',
          data: ['Facebook', 'Instagram', 'Twitter', 'YouTube'],
          axisLine: { show: false },
          axisTick: { show: false }
        },
        yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false } },
        series: [{
          type: 'bar',
          data: [125, 85, 65, 35],
          itemStyle: { color: 'rgba(251, 191, 114, 1)', borderRadius: [4, 4, 0, 0] }
        }]
      };
      socialGrowthChart.setOption(socialGrowthOption);
    }

    // Visitor Origin Chart
    if (visitorOriginChartRef.current) {
      const visitorOriginChart = echarts.init(visitorOriginChartRef.current);
      const visitorOriginOption = {
        animation: false,
        series: [{
          type: 'pie',
          radius: '60%',
          data: [
            { value: 75, name: 'Domestic', itemStyle: { color: 'rgba(87, 181, 231, 1)' } },
            { value: 25, name: 'International', itemStyle: { color: 'rgba(141, 211, 199, 1)' } }
          ],
          itemStyle: { borderRadius: 4 }
        }]
      };
      visitorOriginChart.setOption(visitorOriginOption);
    }

    // Age Group Chart
    if (ageGroupChartRef.current) {
      const ageGroupChart = echarts.init(ageGroupChartRef.current);
      const ageGroupOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: {
          type: 'category',
          data: ['18-25', '26-35', '36-45', '46-55', '55+'],
          axisLine: { show: false },
          axisTick: { show: false }
        },
        yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false } },
        series: [{
          type: 'bar',
          data: [480, 680, 520, 380, 280],
          itemStyle: { color: 'rgba(87, 181, 231, 1)', borderRadius: [4, 4, 0, 0] }
        }]
      };
      ageGroupChart.setOption(ageGroupOption);
    }

    // Travel Purpose Chart
    if (travelPurposeChartRef.current) {
      const travelPurposeChart = echarts.init(travelPurposeChartRef.current);
      const travelPurposeOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 80 },
        xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false } },
        yAxis: {
          type: 'category',
          data: ['Research', 'Business', 'Education', 'Leisure'],
          axisLine: { show: false },
          axisTick: { show: false }
        },
        series: [{
          type: 'bar',
          data: [6, 12, 20, 68],
          itemStyle: { color: 'rgba(141, 211, 199, 1)', borderRadius: [0, 4, 4, 0] }
        }]
      };
      travelPurposeChart.setOption(travelPurposeOption);
    }

    // Monthly Influx Chart
    if (monthlyInfluxChartRef.current) {
      const monthlyInfluxChart = echarts.init(monthlyInfluxChartRef.current);
      const monthlyInfluxOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          axisLine: { show: false },
          axisTick: { show: false }
        },
        yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false } },
        series: [{
          type: 'line',
          data: [180, 220, 280, 320, 380, 420],
          smooth: true,
          symbol: 'none',
          lineStyle: { color: 'rgba(87, 181, 231, 1)', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(87, 181, 231, 0.2)' },
                { offset: 1, color: 'rgba(87, 181, 231, 0.05)' }
              ]
            }
          }
        }]
      };
      monthlyInfluxChart.setOption(monthlyInfluxOption);
    }

    // Crowd Trend Chart
    if (crowdTrendChartRef.current) {
      const crowdTrendChart = echarts.init(crowdTrendChartRef.current);
      const crowdTrendOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: {
          type: 'category',
          data: ['9AM', '11AM', '1PM', '3PM', '5PM'],
          axisLine: { show: false },
          axisTick: { show: false }
        },
        yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false } },
        series: [{
          type: 'line',
          data: [800, 1100, 1400, 1200, 900],
          smooth: true,
          symbol: 'none',
          lineStyle: { color: 'rgba(87, 181, 231, 1)', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(87, 181, 231, 0.2)' },
                { offset: 1, color: 'rgba(87, 181, 231, 0.05)' }
              ]
            }
          }
        }]
      };
      crowdTrendChart.setOption(crowdTrendOption);
    }

    // Time Slot Congestion Chart
    if (timeSlotChartRef.current) {
      const timeSlotChart = echarts.init(timeSlotChartRef.current);
      const timeSlotOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: {
          type: 'category',
          data: ['9-11AM', '11-1PM', '1-3PM', '3-5PM', '5-7PM'],
          axisLine: { show: false },
          axisTick: { show: false },
        },
        yAxis: { 
          type: 'value', 
          axisLine: { show: false }, 
          axisTick: { show: false },
        },
        series: [{
          type: 'bar',
          data: [650, 1200, 1450, 980, 720],
          itemStyle: { 
            color: function(params: any) {
              const colors = [
                chartColors[1],
                chartColors[2],
                chartColors[3],
                chartColors[2],
                chartColors[1],
              ];
              return colors[params.dataIndex];
            },
            borderRadius: [4, 4, 0, 0] 
          },
        }]
      };
      timeSlotChart.setOption(timeSlotOption);
    }

    // Heritage Health Chart
    if (heritageHealthChartRef.current) {
      const heritageHealthChart = echarts.init(heritageHealthChartRef.current);
      const heritageHealthOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          axisLine: { show: false },
          axisTick: { show: false }
        },
        yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false } },
        series: [{
          type: 'line',
          data: [85, 88, 92, 89, 91, 94],
          smooth: true,
          symbol: 'none',
          lineStyle: { color: 'rgba(87, 181, 231, 1)', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(87, 181, 231, 0.2)' },
                { offset: 1, color: 'rgba(87, 181, 231, 0.05)' }
              ]
            }
          }
        }]
      };
      heritageHealthChart.setOption(heritageHealthOption);
    }

    // Condition Scores Chart
    const conditionScoresChartElement = document.getElementById("conditionScoresChart");
    if (conditionScoresChartElement) {
      const conditionScoresChart = echarts.init(conditionScoresChartElement);
      const conditionScoresOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: {
          type: "category",
          data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          axisLine: { show: false },
          axisTick: { show: false },
        },
        yAxis: {
          type: "value",
          min: 0,
          max: 10,
          axisLine: { show: false },
          axisTick: { show: false },
        },
        series: [
          {
            name: "Main Structure",
            type: "line",
            data: [8.2, 8.1, 8.3, 8.0, 8.4, 8.5],
            smooth: true,
            symbol: "none",
            lineStyle: { color: chartColors[0], width: 2 },
          },
          {
            name: "Wall Paintings",
            type: "line",
            data: [6.8, 6.5, 6.3, 6.1, 6.0, 6.2],
            smooth: true,
            symbol: "none",
            lineStyle: { color: chartColors[2], width: 2 },
          },
          {
            name: "Flooring",
            type: "line",
            data: [7.5, 7.6, 7.8, 7.7, 7.9, 7.8],
            smooth: true,
            symbol: "none",
            lineStyle: { color: chartColors[1], width: 2 },
          },
        ],
      };
      conditionScoresChart.setOption(conditionScoresOption);
    }

    // Heritage Health Index Trend Chart
    const hhiTrendChartElement = document.getElementById("hhiTrendChart");
    if (hhiTrendChartElement) {
      const hhiTrendChart = echarts.init(hhiTrendChartElement);
      const hhiTrendOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: {
          type: "category",
          data: [
            "Site A",
            "Site B",
            "Site C",
            "Site D",
            "Site E",
            "Site F",
            "Site G",
            "Site H",
          ],
          axisLine: { show: false },
          axisTick: { show: false },
        },
        yAxis: {
          type: "value",
          min: 0,
          max: 10,
          axisLine: { show: false },
          axisTick: { show: false },
        },
        series: [
          {
            type: "bar",
            data: [8.5, 6.2, 7.8, 9.1, 5.4, 8.0, 7.2, 8.8],
            itemStyle: {
              color: function (params: any) {
                if (params.value >= 8) return chartColors[1];
                if (params.value >= 6) return chartColors[2];
                return chartColors[3];
              },
              borderRadius: [4, 4, 0, 0],
            },
          },
        ],
      };
      hhiTrendChart.setOption(hhiTrendOption);
    }

    // Conservation Status Chart
    if (conservationStatusChartRef.current) {
      const conservationStatusChart = echarts.init(conservationStatusChartRef.current);
      const conservationStatusOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false } },
        yAxis: {
          type: 'category',
          data: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
          axisLine: { show: false },
          axisTick: { show: false }
        },
        series: [{
          type: 'bar',
          data: [45, 32, 18, 8, 2],
          itemStyle: { color: 'rgba(141, 211, 199, 1)', borderRadius: [0, 4, 4, 0] }
        }]
      };
      conservationStatusChart.setOption(conservationStatusOption);
    }

    // Visitor Behavior Chart
    if (visitorBehaviorChartRef.current) {
      const visitorBehaviorChart = echarts.init(visitorBehaviorChartRef.current);
      const visitorBehaviorOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisLine: { show: false },
          axisTick: { show: false }
        },
        yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false } },
        series: [{
          type: 'line',
          data: [1200, 1350, 1100, 1400, 1600, 1800, 1500],
          smooth: true,
          symbol: 'none',
          lineStyle: { color: 'rgba(87, 181, 231, 1)', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(87, 181, 231, 0.2)' },
                { offset: 1, color: 'rgba(87, 181, 231, 0.05)' }
              ]
            }
          }
        }]
      };
      visitorBehaviorChart.setOption(visitorBehaviorOption);
    }

    // Satisfaction Chart
    if (satisfactionChartRef.current) {
      const satisfactionChart = echarts.init(satisfactionChartRef.current);
      const satisfactionOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false } },
        yAxis: {
          type: 'category',
          data: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
          axisLine: { show: false },
          axisTick: { show: false }
        },
        series: [{
          type: 'bar',
          data: [65, 25, 8, 2, 1],
          itemStyle: { color: 'rgba(87, 181, 231, 1)', borderRadius: [0, 4, 4, 0] }
        }]
      };
      satisfactionChart.setOption(satisfactionOption);
    }

    // Interest Radar Chart
    if (interestRadarChartRef.current) {
      const interestRadarChart = echarts.init(interestRadarChartRef.current);
      interestRadarChart.setOption({
        animation: false,
        radar: {
          indicator: [
            { name: "Architecture", max: 100 },
            { name: "History", max: 100 },
            { name: "Culture", max: 100 },
            { name: "Art", max: 100 },
            { name: "Photography", max: 100 },
            { name: "Education", max: 100 },
          ],
        },
        series: [
          {
            type: "radar",
            data: [
              {
                value: [85, 92, 78, 65, 88, 72],
                itemStyle: { color: chartColors[0] },
                areaStyle: { color: chartColors[0] + "30" },
              },
            ],
          },
        ],
      });
    }

    // Device Usage Chart
    if (deviceUsageChartRef.current) {
      const deviceUsageChart = echarts.init(deviceUsageChartRef.current);
      deviceUsageChart.setOption({
        animation: false,
        series: [
          {
            type: "pie",
            radius: "60%",
            data: [
              { value: 60, name: "Mobile", itemStyle: { color: chartColors[0] } },
              { value: 25, name: "Desktop", itemStyle: { color: chartColors[1] } },
              { value: 15, name: "Tablet", itemStyle: { color: chartColors[2] } },
            ],
            itemStyle: { borderRadius: 4 },
          },
        ],
      });
    }

    // Conversion Rate Chart
    if (conversionChartRef.current) {
      const conversionChart = echarts.init(conversionChartRef.current);
      conversionChart.setOption({
        animation: false,
        series: [
          {
            type: "pie",
            radius: "60%",
            data: [
              { value: 24, name: "Booked", itemStyle: { color: chartColors[1] } },
              { value: 76, name: "Wishlisted", itemStyle: { color: chartColors[0] } },
            ],
            itemStyle: { borderRadius: 4 },
          },
        ],
      });
    }

    // Top Wishlisted Items Chart
    if (wishlistChartRef.current) {
      const wishlistChart = echarts.init(wishlistChartRef.current);
      wishlistChart.setOption({
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 80 },
        xAxis: {
          type: "category",
          data: ["Taj Mahal", "Red Fort", "Qutub Minar", "India Gate", "Lotus Temple"],
          axisLine: { show: false },
          axisTick: { show: false },
        },
        yAxis: {
          type: "value",
          axisLine: { show: false },
          axisTick: { show: false },
        },
        series: [
          {
            type: "bar",
            data: [2340, 1890, 1560, 1340, 1120],
            itemStyle: { color: chartColors[2], borderRadius: [4, 4, 0, 0] },
          },
        ],
      });
    }

    // Avg Time Spent per Site Chart
    if (timeSpentChartRef.current) {
      const timeSpentChart = echarts.init(timeSpentChartRef.current);
      timeSpentChart.setOption({
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 80 },
        xAxis: { type: "value", axisLine: { show: false }, axisTick: { show: false } },
        yAxis: {
          type: "category",
          data: ["Museums", "Temples", "Forts", "Gardens", "Monuments"],
          axisLine: { show: false },
          axisTick: { show: false },
        },
        series: [
          {
            type: "bar",
            data: [45, 38, 52, 28, 41],
            itemStyle: { color: chartColors[0], borderRadius: [0, 4, 4, 0] },
          },
        ],
      });
    }

    // Sentiment Analysis Chart
    if (sentimentChartRef.current) {
      const sentimentChart = echarts.init(sentimentChartRef.current);
      sentimentChart.setOption({
        animation: false,
        series: [
          {
            type: "pie",
            radius: "60%",
            data: [
              { value: 72, name: "Positive", itemStyle: { color: chartColors[1] } },
              { value: 20, name: "Neutral", itemStyle: { color: chartColors[2] } },
              { value: 8, name: "Negative", itemStyle: { color: chartColors[3] } },
            ],
            itemStyle: { borderRadius: 4 },
          },
        ],
      });
    }
  };


  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleSidebarTabChange = (tab: string) => {
    if (onPageChange) {
      onPageChange(tab);
    }
  };

  return (
    <div className="flex h-screen bg-[#FDF8F4]">
      {/* Sidebar */}
       <Sidebar 
        activeTab="dashboard" 
        onTabChange={handleSidebarTabChange}
        isExpanded={sidebarExpanded}
        onToggle={handleSidebarToggle}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
              <div className="text-sm text-gray-500">Heritage Management System</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {dateFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedDateFilter(filter)}
                    className={`px-3 py-1.5 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-button whitespace-nowrap ${
                      selectedDateFilter === filter ? 'text-primary bg-gray-100' : ''
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
                <div className="relative">
                  <input 
                    type="text" 
                    className="px-3 py-1.5 border border-gray-200 rounded-button text-sm w-44" 
                    placeholder="Custom Date Range" 
                    readOnly 
                  />
                  <i className="ri-calendar-line absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-gray-100 rounded-button">
                  <i className="ri-refresh-line"></i>
                </button>
                <div className="relative">
                  <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-gray-100 rounded-button">
                    <i className="ri-download-line"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Tab Navigation */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="flex space-x-12">
              {mainTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedMainTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium transition-all duration-200 ${
                    selectedMainTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'application' && (
                    <div className="flex flex-col items-center">
                      <span>Application</span>
                      <span>Analytics</span>
                    </div>
                  )}
                  {tab === 'website' && (
                    <div className="flex flex-col items-center">
                      <span>Website</span>
                      <span>Analytics</span>
                    </div>
                  )}
                  {tab === 'revenue' && (
                    <div className="flex flex-col items-center">
                      <span>Revenue</span>
                      <span>Analytics</span>
                    </div>
                  )}
                  {tab === 'social' && (
                    <div className="flex flex-col items-center">
                      <span>Social</span>
                      <span>Media</span>
                    </div>
                  )}
                  {tab === 'tourism' && (
                    <div className="flex flex-col items-center">
                      <span>Tourism</span>
                      <span>Influx</span>
                    </div>
                  )}
                  {tab === 'crowd' && (
                    <div className="flex flex-col items-center">
                      <span>Crowd</span>
                      <span>Management</span>
                    </div>
                  )}
                  {tab === 'heritage' && (
                    <div className="flex flex-col items-center">
                      <span>Heritage</span>
                      <span>Health</span>
                    </div>
                  )}
                  {tab === 'behavior' && (
                    <div className="flex flex-col items-center">
                      <span>Tourist</span>
                      <span>Behavior</span>
                    </div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Application Analytics */}
          {selectedMainTab === 'application' && (
            <div className="grid grid-cols-12 gap-6">
              {/* iOS/Android Downloads */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">App Downloads</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">245K</div>
                      <div className="text-sm text-gray-600">iOS Downloads</div>
                      <div className="text-xs text-green-600">+12% from last month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">189K</div>
                      <div className="text-sm text-gray-600">Android Downloads</div>
                      <div className="text-xs text-green-600">+8% from last month</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Shares by Channel */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Download Channels</h3>
                  <div ref={channelChartRef} style={{ height: '200px' }}></div>
                </div>
              </div>

              {/* Download Growth Trend */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Download Growth Trend</h3>
                  <div ref={downloadGrowthChartRef} style={{ height: '200px' }}></div>
                </div>
              </div>

              {/* User Growth */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                  <div ref={userGrowthChartRef} style={{ height: '200px' }}></div>
                </div>
              </div>

              {/* MAU/DAU */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Active Users</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">87.5K</div>
                      <div className="text-sm text-gray-600">Monthly Active Users</div>
                      <div className="text-xs text-green-600">+15% MoM</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">12.3K</div>
                      <div className="text-sm text-gray-600">Daily Active Users</div>
                      <div className="text-xs text-green-600">+5% DoD</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Retention Rate */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Retention Rate</h3>
                  <div className="grid grid-cols-7 gap-1">
                    <div className="text-xs text-gray-600 text-center">Day 1</div>
                    <div className="text-xs text-gray-600 text-center">Day 3</div>
                    <div className="text-xs text-gray-600 text-center">Day 7</div>
                    <div className="text-xs text-gray-600 text-center">Day 14</div>
                    <div className="text-xs text-gray-600 text-center">Day 30</div>
                    <div className="text-xs text-gray-600 text-center">Day 60</div>
                    <div className="text-xs text-gray-600 text-center">Day 90</div>
                    <div className="h-8 bg-primary rounded text-white text-xs flex items-center justify-center">78%</div>
                    <div className="h-8 bg-primary/80 rounded text-white text-xs flex items-center justify-center">65%</div>
                    <div className="h-8 bg-primary/60 rounded text-white text-xs flex items-center justify-center">52%</div>
                    <div className="h-8 bg-primary/40 rounded text-white text-xs flex items-center justify-center">43%</div>
                    <div className="h-8 bg-primary/30 rounded text-white text-xs flex items-center justify-center">38%</div>
                    <div className="h-8 bg-primary/20 rounded text-white text-xs flex items-center justify-center">32%</div>
                    <div className="h-8 bg-primary/10 rounded text-gray-700 text-xs flex items-center justify-center">28%</div>
                  </div>
                </div>
              </div>

              {/* Signups by Type */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Signups by User Type</h3>
                  <div ref={signupTypeChartRef} style={{ height: '200px' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Other analytics sections would go here */}


          {/* Website Analytics */}
          {selectedMainTab === 'website' && (
            <div className="grid grid-cols-12 gap-6">
              {/* Page Views / Unique Visitors */}
              <div className="col-span-4">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Website Traffic</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold text-primary">1.2M</div>
                      <div className="text-sm text-gray-600">Page Views</div>
                      <div className="text-xs text-green-600">+18% from last month</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">456K</div>
                      <div className="text-sm text-gray-600">Unique Visitors</div>
                      <div className="text-xs text-green-600">+12% from last month</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Average Time on Site */}
              <div className="col-span-4">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Avg Time on Site</h3>
                  <div ref={timeOnSiteChartRef} style={{ height: '150px' }}></div>
                </div>
              </div>

              {/* Top Cities */}
              <div className="col-span-4">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Top Cities</h3>
                  <div ref={topCitiesChartRef} style={{ height: '150px' }}></div>
                </div>
              </div>

              {/* Device Type Split */}
              <div className="col-span-4">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Device Types</h3>
                  <div ref={deviceTypeChartRef} style={{ height: '150px' }}></div>
                </div>
              </div>

              {/* Most Clicked Pages */}
              <div className="col-span-4">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Most Clicked Pages</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Heritage Sites</span>
                      <span className="text-sm font-semibold">23.4K</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Virtual Tours</span>
                      <span className="text-sm font-semibold">18.7K</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Events</span>
                      <span className="text-sm font-semibold">15.2K</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Booking</span>
                      <span className="text-sm font-semibold">12.8K</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Type */}
              <div className="col-span-4">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">User Type</h3>
                  <div ref={userTypeChartRef} style={{ height: '150px' }}></div>
                </div>
              </div>

              {/* Blog Performance */}
              <div className="col-span-12">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Blog Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold">Article Title</th>
                          <th className="text-left py-3 px-4 font-semibold">Views</th>
                          <th className="text-left py-3 px-4 font-semibold">Shares</th>
                          <th className="text-left py-3 px-4 font-semibold">Comments</th>
                          <th className="text-left py-3 px-4 font-semibold">Published</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4">Exploring Ancient Temples of Rajasthan</td>
                          <td className="py-3 px-4">45.2K</td>
                          <td className="py-3 px-4">1.2K</td>
                          <td className="py-3 px-4">89</td>
                          <td className="py-3 px-4">Dec 15, 2024</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4">Heritage Conservation Techniques</td>
                          <td className="py-3 px-4">38.7K</td>
                          <td className="py-3 px-4">987</td>
                          <td className="py-3 px-4">67</td>
                          <td className="py-3 px-4">Dec 12, 2024</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4">Digital Preservation Methods</td>
                          <td className="py-3 px-4">32.1K</td>
                          <td className="py-3 px-4">756</td>
                          <td className="py-3 px-4">54</td>
                          <td className="py-3 px-4">Dec 10, 2024</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other analytics sections would go here */}


          {/* Revenue Analytics */}
          {selectedMainTab === 'revenue' && (
            <div className="grid grid-cols-12 gap-6">
              {/* Revenue by Category */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
                  <div ref={revenueCategoryChartRef} style={{ height: '250px' }}></div>
                </div>
              </div>

              {/* Revenue Over Time */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                  <div ref={revenueTimeChartRef} style={{ height: '250px' }}></div>
                </div>
              </div>

              {/* Top Revenue Sources */}
              <div className="col-span-12">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Top Revenue Sources</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold">Source</th>
                          <th className="text-left py-3 px-4 font-semibold">Revenue</th>
                          <th className="text-left py-3 px-4 font-semibold">Growth</th>
                          <th className="text-left py-3 px-4 font-semibold">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4">Ticket Sales</td>
                          <td className="py-3 px-4 font-semibold">$2.4M</td>
                          <td className="py-3 px-4 text-green-600">+15%</td>
                          <td className="py-3 px-4">45.2%</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4">Guided Tours</td>
                          <td className="py-3 px-4 font-semibold">$1.8M</td>
                          <td className="py-3 px-4 text-green-600">+22%</td>
                          <td className="py-3 px-4">33.8%</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4">Merchandise</td>
                          <td className="py-3 px-4 font-semibold">$650K</td>
                          <td className="py-3 px-4 text-green-600">+8%</td>
                          <td className="py-3 px-4">12.3%</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4">Events</td>
                          <td className="py-3 px-4 font-semibold">$480K</td>
                          <td className="py-3 px-4 text-green-600">+12%</td>
                          <td className="py-3 px-4">8.7%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Analytics */}
          {selectedMainTab === 'social' && (
            <div className="grid grid-cols-12 gap-6">
              {/* Platform Stats */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Platform Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                        <i className="ri-facebook-fill text-blue-600 text-xl"></i>
                      </div>
                      <div className="text-xl font-bold">125K</div>
                      <div className="text-sm text-gray-600">Followers</div>
                    </div>
                    <div className="text-center p-4 bg-pink-50 rounded-lg">
                      <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                        <i className="ri-instagram-fill text-pink-600 text-xl"></i>
                      </div>
                      <div className="text-xl font-bold">89K</div>
                      <div className="text-sm text-gray-600">Followers</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                        <i className="ri-twitter-fill text-blue-500 text-xl"></i>
                      </div>
                      <div className="text-xl font-bold">67K</div>
                      <div className="text-sm text-gray-600">Followers</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                        <i className="ri-youtube-fill text-red-600 text-xl"></i>
                      </div>
                      <div className="text-xl font-bold">43K</div>
                      <div className="text-sm text-gray-600">Subscribers</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Overview */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Engagement Overview</h3>
                  <div ref={engagementChartRef} style={{ height: '200px' }}></div>
                </div>
              </div>

              {/* Top Performing Content */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Top Performing Content</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Virtual Tour: Taj Mahal</div>
                        <div className="text-sm text-gray-600">Instagram Post</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">45.2K</div>
                        <div className="text-sm text-gray-600">Likes</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Heritage Photography Tips</div>
                        <div className="text-sm text-gray-600">Facebook Post</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">38.7K</div>
                        <div className="text-sm text-gray-600">Engagements</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Growth Trends */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Growth Trends</h3>
                  <div ref={socialGrowthChartRef} style={{ height: '200px' }}></div>
                </div>
              </div>
            </div>
          )}

          

          {/* Tourism Analytics */}
          {selectedMainTab === 'tourism' && (
            <div className="grid grid-cols-12 gap-6">
              {/* Total Visitors */}
              <div className="col-span-3">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Total Visitors</h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">2.4M</div>
                    <div className="text-sm text-gray-600">This Year</div>
                    <div className="text-xs text-green-600">+18% from last year</div>
                  </div>
                </div>
              </div>

              {/* Domestic vs International */}
              <div className="col-span-3">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Visitor Origin</h3>
                  <div ref={visitorOriginChartRef} style={{ height: '150px' }}></div>
                </div>
              </div>

              {/* Age Group Distribution */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Age Group Distribution</h3>
                  <div ref={ageGroupChartRef} style={{ height: '200px' }}></div>
                </div>
              </div>

              {/* Travel Purpose */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Travel Purpose</h3>
                  <div ref={travelPurposeChartRef} style={{ height: '200px' }}></div>
                </div>
              </div>

              {/* Monthly Influx */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Monthly Visitor Influx</h3>
                  <div ref={monthlyInfluxChartRef} style={{ height: '200px' }}></div>
                </div>
              </div>

              {/* Top Cities of Origin */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Top Cities of Origin</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Delhi</span>
                      <span className="text-primary font-semibold">234K visitors</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Mumbai</span>
                      <span className="text-primary font-semibold">189K visitors</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Bangalore</span>
                      <span className="text-primary font-semibold">156K visitors</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">London</span>
                      <span className="text-primary font-semibold">87K visitors</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">New York</span>
                      <span className="text-primary font-semibold">76K visitors</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Crowd Management Analytics */}
          {selectedMainTab === 'crowd' && (
            <div className="grid grid-cols-12 gap-6">
              {/* Live Footfall */}
              <div className="col-span-3">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Live Footfall</h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">1,247</div>
                    <div className="text-sm text-gray-600">Current Visitors</div>
                    <div className="text-xs text-orange-600">Peak: 2,100</div>
                  </div>
                </div>
              </div>

              {/* Risk Level */}
              <div className="col-span-3">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Risk Level</h3>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-yellow-100 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
                    </div>
                    <div className="font-semibold text-yellow-600">MODERATE</div>
                    <div className="text-sm text-gray-600">Crowd Density</div>
                  </div>
                </div>
              </div>

              {/* Capacity Status */}
              <div className="col-span-3">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Capacity Status</h3>
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
                      <div
                        className="absolute inset-0 bg-primary rounded-full"
                        style={{clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 72%, 72% 100%, 50% 50%)"}}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold">72%</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Capacity Utilized</div>
                  </div>
                </div>
              </div>

              {/* Today's Trend - Now on same row as other cards */}
              <div className="col-span-3">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Today's Trend</h3>
                  <div ref={crowdTrendChartRef} style={{ height: '120px' }}></div>
                </div>
              </div>

              {/* Congested Areas */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Congested Areas</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div>
                          <div className="font-medium text-gray-900">Main Entrance</div>
                          <div className="text-sm text-gray-600">Heritage Gate</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-600 font-semibold text-sm">HIGH</div>
                        <div className="text-xs text-gray-500">456 people</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div>
                          <div className="font-medium text-gray-900">Museum Hall</div>
                          <div className="text-sm text-gray-600">Central Exhibition</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-600 font-semibold text-sm">MEDIUM</div>
                        <div className="text-xs text-gray-500">289 people</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="font-medium text-gray-900">Garden Area</div>
                          <div className="text-sm text-gray-600">Outdoor Space</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-semibold text-sm">LOW</div>
                        <div className="text-xs text-gray-500">123 people</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Slot Congestion */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Time Slot Congestion</h3>
                  <div ref={timeSlotChartRef} style={{ height: '200px' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Heritage Health Analytics */}
          {selectedMainTab === 'heritage' && (
            <div className="grid grid-cols-12 gap-6">
              {/* Site Condition Scores */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Site Condition Scores</h3>
                  <div id="conditionScoresChart" style={{ height: '250px' }}></div>
                </div>
              </div>

              {/* AI Tags Extracted */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">AI Analysis Tags</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        Structural Damage
                      </span>
                      <span className="text-sm font-semibold">12 instances</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        Weather Erosion
                      </span>
                      <span className="text-sm font-semibold">8 instances</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                        Paint Deterioration
                      </span>
                      <span className="text-sm font-semibold">15 instances</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        Vegetation Growth
                      </span>
                      <span className="text-sm font-semibold">6 instances</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Good Condition
                      </span>
                      <span className="text-sm font-semibold">23 instances</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Inspections */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Recent Inspections</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium">Main Temple Structure</div>
                        <div className="text-sm text-gray-600">Inspected on Dec 20, 2024</div>
                        <div className="text-xs text-green-600">Score: 8.5/10</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium">Eastern Wall Paintings</div>
                        <div className="text-sm text-gray-600">Inspected on Dec 18, 2024</div>
                        <div className="text-xs text-yellow-600">Score: 6.2/10</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium">Courtyard Flooring</div>
                        <div className="text-sm text-gray-600">Inspected on Dec 15, 2024</div>
                        <div className="text-xs text-green-600">Score: 7.8/10</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flagged Photos */}
              <div className="col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Flagged Photos</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="aspect-square bg-red-100 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <i className="ri-image-line text-red-600"></i>
                      </div>
                    </div>
                    <div className="aspect-square bg-yellow-100 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <i className="ri-image-line text-yellow-600"></i>
                      </div>
                    </div>
                    <div className="aspect-square bg-orange-100 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <i className="ri-image-line text-orange-600"></i>
                      </div>
                    </div>
                    <div className="aspect-square bg-red-100 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <i className="ri-image-line text-red-600"></i>
                      </div>
                    </div>
                    <div className="aspect-square bg-yellow-100 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <i className="ri-image-line text-yellow-600"></i>
                      </div>
                    </div>
                    <div className="aspect-square bg-blue-100 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <i className="ri-image-line text-blue-600"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall HHI Trend */}
              <div className="col-span-12">
                <div className="bg-white rounded-xl shadow-sm p-6 relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <i className="ri-download-line"></i>
                  </button>
                  <h3 className="text-lg font-semibold mb-4">Heritage Health Index Trend</h3>
                  <div id="hhiTrendChart" style={{ height: '300px' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Tourist Behavior Analytics */}
          {selectedMainTab === 'behavior' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Interest by Category */}
            <div className="col-span-6">
              <div className="bg-white rounded-xl shadow-sm p-6 relative">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                  <i className="ri-download-line"></i>
                </button>
                <h3 className="text-lg font-semibold mb-4">Interest by Category</h3>
                <div ref={interestRadarChartRef} style={{ height: '250px' }}></div>
              </div>
            </div>

            {/* Device Usage */}
            <div className="col-span-3">
              <div className="bg-white rounded-xl shadow-sm p-6 relative">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                  <i className="ri-download-line"></i>
                </button>
                <h3 className="text-lg font-semibold mb-4">Device Usage</h3>
                <div ref={deviceUsageChartRef} style={{ height: '150px' }}></div>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="col-span-3">
              <div className="bg-white rounded-xl shadow-sm p-6 relative">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                  <i className="ri-download-line"></i>
                </button>
                <h3 className="text-lg font-semibold mb-4">Conversion Rate</h3>
                <div ref={conversionChartRef} style={{ height: '150px' }}></div>
              </div>
            </div>

            {/* Top Wishlisted Items */}
            <div className="col-span-6">
              <div className="bg-white rounded-xl shadow-sm p-6 relative">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                  <i className="ri-download-line"></i>
                </button>
                <h3 className="text-lg font-semibold mb-4">Top Wishlisted Items</h3>
                <div ref={wishlistChartRef} style={{ height: '200px' }}></div>
              </div>
            </div>

            {/* Avg Time Spent per Site */}
            <div className="col-span-6">
              <div className="bg-white rounded-xl shadow-sm p-6 relative">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                  <i className="ri-download-line"></i>
                </button>
                <h3 className="text-lg font-semibold mb-4">Avg Time Spent per Site</h3>
                <div ref={timeSpentChartRef} style={{ height: '200px' }}></div>
              </div>
            </div>

            {/* Sentiment Analysis */}
            <div className="col-span-12">
              <div className="bg-white rounded-xl shadow-sm p-6 relative">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                  <i className="ri-download-line"></i>
                </button>
                <h3 className="text-lg font-semibold mb-4">Sentiment Analysis</h3>
                <div ref={sentimentChartRef} style={{ height: '150px' }}></div>
              </div>
            </div>
          </div>
        )}


        </main>
      </div>
    </div>
  );
};

export default Dashboard;
