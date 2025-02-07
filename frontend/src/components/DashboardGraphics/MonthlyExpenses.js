import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MonthlyExpenses = ({ refresh, userId }) => {  // ✅ Accept userId
    const [monthlyExpenses, setMonthlyExpenses] = useState({});

    useEffect(() => {
        if (userId) {  // ✅ Ensure userId exists before calling API
            fetchExpenses();
        }
    }, [refresh, userId]);

    const fetchExpenses = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/get-expenses/${userId}`); // ✅ Use userId
            if (!response.ok) throw new Error('Failed to fetch expense data');
            const data = await response.json();
            const expenseByMonth = data.reduce((acc, expense) => {
                const date = new Date(expense.date);
                const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                if (!acc[monthYear]) acc[monthYear] = 0;
                acc[monthYear] += parseFloat(expense.amount);
                return acc;
            }, {});
            setMonthlyExpenses(expenseByMonth);
        } catch (error) {
            console.error(error);
        }
    };
    

    // Convert object into sorted arrays for Chart.js
    const months = Object.keys(monthlyExpenses).sort((a, b) => new Date(a) - new Date(b)); // Sort in chronological order
    const amounts = months.map(month => monthlyExpenses[month]); // Get corresponding values

    // Chart.js data
    const chartData = {
        labels: months, // X-axis: Months
        datasets: [
            {
                label: 'Monthly Expense',
                data: amounts, // Y-axis: Expense
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: true },
            tooltip: { enabled: true }
        },
        scales: {
            x: { title: { display: true, text: 'Month' } },
            y: { title: { display: true, text: 'Expenses ($)' }, beginAtZero: true }
        }
    };

    return (
        <MonthlyExpenseStyled>
            <div className="expense-container">
                <h2>Monthly Expense Overview</h2>
                {months.length > 0 ? (
                    <div className="chart-wrapper">
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                ) : (
                    <p>Loading expense data...</p>
                )}
            </div>
        </MonthlyExpenseStyled>
    );
};

const MonthlyExpenseStyled = styled.div`
    width: 80%;

    .expense-container {
        background-color: #f9f9f9;
        border: 3px solid black;
        border-radius: 15px;
        padding: 1rem;
        width: 80%;
        min-height: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .chart-wrapper {
        width: 90%; /* Ensure it doesn't stretch too much */
        max-width: 600px; /* Limit width for better visuals */
        height: 300px;
        display: flex;
        justify-content: center; /* Center the chart inside */
        align-items: center;
    }
`;

export default MonthlyExpenses;
