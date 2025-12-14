import styled, { css, keyframes } from 'styled-components';
import { Upload, File, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';

// ShadcnUI-inspired FileUpload styles
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const DropZone = styled.div`
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 150ms;
  background: ${({ theme }) => theme.colors.background};

  ${({ $isDragging, theme }) => $isDragging && css`
    border-color: ${theme.colors.ring};
    background: ${theme.colors.muted};
  `}

  ${({ $hasError, theme }) => $hasError && css`
    border-color: ${theme.colors.error};
  `}

  ${({ $hasFile, theme }) => $hasFile && css`
    border-color: ${theme.colors.success};
    background: ${theme.colors.successLight};
  `}

  &:hover {
    border-color: ${({ theme }) => theme.colors.ring};
    background: ${({ theme }) => theme.colors.muted};
  }
`;

const DropZoneContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

const IconWrapper = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

const DropZoneText = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;

  span {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 4px;
  }
`;

const DropZoneHint = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.muted};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-top: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileSize = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

const RemoveButton = styled.button`
  padding: 0.25rem;
  color: ${({ theme }) => theme.colors.textMuted};
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: all 150ms;

  &:hover {
    color: ${({ theme }) => theme.colors.error};
    background: ${({ theme }) => theme.colors.errorLight};
  }
`;

const VerificationStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.75rem;

  ${({ $status, theme }) => {
    switch ($status) {
      case 'verifying':
        return css`
          background: ${theme.colors.warningLight};
          color: ${theme.colors.warningDark};
        `;
      case 'verified':
        return css`
          background: ${theme.colors.successLight};
          color: ${theme.colors.successDark};
        `;
      case 'error':
        return css`
          background: ${theme.colors.errorLight};
          color: ${theme.colors.errorDark};
        `;
      default:
        return '';
    }
  }}

  svg {
    width: 0.875rem;
    height: 0.875rem;
    ${({ $status }) => $status === 'verifying' && css`
      animation: ${rotate} 1s linear infinite;
    `}
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.375rem;

  ${({ $required }) => $required && css`
    &::after {
      content: ' *';
      color: ${({ theme }) => theme.colors.error};
    }
  `}
`;

const ErrorMessage = styled.p`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.error};
  margin: 0.5rem 0 0;
`;

const HiddenInput = styled.input`
  display: none;
`;

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileUpload = ({
  label,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 10 * 1024 * 1024, // 10MB
  required,
  error,
  value,
  onChange,
  onVerify,
  verificationStatus,
  verificationMessage,
  hint,
  ...props
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleFile = useCallback((file) => {
    if (file.size > maxSize) {
      onChange?.(null, `Le fichier dépasse la taille maximale de ${formatFileSize(maxSize)}`);
      return;
    }

    onChange?.(file);
    
    if (onVerify) {
      onVerify(file);
    }
  }, [maxSize, onChange, onVerify]);

  const handleInputChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleRemove = useCallback((e) => {
    e.stopPropagation();
    onChange?.(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onChange]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      {label && <Label $required={required}>{label}</Label>}
      
      <DropZone
        $isDragging={isDragging}
        $hasError={!!error}
        $hasFile={!!value}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <DropZoneContent>
          <IconWrapper>
            <Upload />
          </IconWrapper>
          <div>
            <DropZoneText>
              Glissez-déposez votre fichier ici ou <span>parcourir</span>
            </DropZoneText>
            <DropZoneHint>
              {hint || `Formats acceptés: ${accept.replace(/\./g, '').toUpperCase()} (Max: ${formatFileSize(maxSize)})`}
            </DropZoneHint>
          </div>
        </DropZoneContent>
      </DropZone>

      <HiddenInput
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        {...props}
      />

      {value && (
        <FilePreview>
          <File size={24} />
          <FileInfo>
            <FileName>{value.name}</FileName>
            <FileSize>{formatFileSize(value.size)}</FileSize>
          </FileInfo>
          <RemoveButton type="button" onClick={handleRemove}>
            <X size={20} />
          </RemoveButton>
        </FilePreview>
      )}

      {verificationStatus && (
        <VerificationStatus $status={verificationStatus}>
          {verificationStatus === 'verifying' && <Loader />}
          {verificationStatus === 'verified' && <CheckCircle />}
          {verificationStatus === 'error' && <AlertCircle />}
          <span>{verificationMessage}</span>
        </VerificationStatus>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
};

export default FileUpload;
