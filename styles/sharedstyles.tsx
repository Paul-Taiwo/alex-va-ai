import styled, { css } from "styled-components";

const inputStyle = css`
  margin: 10px 0;
  padding: 10px;
  border-radius: var(--border-radius);
  border-radius: var(--border-radius);
  border: none;
`;

const Container = styled.div`
  padding: 0 0.5rem;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  height: 100vh;
  min-height: 100vh;
`;

const ChatContainer = styled.div`
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  background: linear-gradient(
    to bottom,
    rgb(var(--background-end-rgb)),
    rgb(var(--background-start-rgb))
  );
  border-radius: var(--border-radius);
  padding: 20px;
`;

const ChatMessages = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  background: rgba(var(--foreground-rgb), 0.1);
  border-radius: var(--border-radius);
`;

const Message = styled.div`
  ${inputStyle}
  background: ${(props) =>
    props.role === "user"
      ? "rgba(var(--foreground-rgb), 0.1)" // User background color
      : "rgba(0, 128, 0, 0.1)"}; // AI background color
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 450px;
  padding: 0;
  position: relative;

  .pen-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
`;

const Input = styled.input`
  ${inputStyle}
  min-height: 44px;
  margin: 0;
  width: 100%;
  padding-left: 40px;
  padding-right: 40px;
`;

const SendButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(to right, #16abff, #0885ff);
  border: none;
  border-radius: var(--border-radius);
  color: white;
  cursor: pointer;

  &:disabled {
    opacity: 0.8;
    cursor: default;
  }
`;

export {
  Container,
  ChatContainer,
  ChatMessages,
  Message,
  InputContainer,
  Input,
  SendButton,
};
